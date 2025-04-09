
"""
Produce Recognition System - ConvNeXt + SAM Training Script
This script trains a ConvNeXt-Large model for produce recognition
and integrates with SAM for segmentation.
"""

import os
import random
import argparse
import numpy as np
from pathlib import Path
import matplotlib.pyplot as plt
from typing import Dict, List, Tuple, Optional

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import torchvision.transforms as transforms
from torchvision.models import convnext_large, ConvNeXt_Large_Weights

from segment_anything import SamAutomaticMaskGenerator, sam_model_registry
from segment_anything.utils.transforms import ResizeLongestSide

# Set random seeds for reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed(SEED)
    torch.backends.cudnn.deterministic = True

class ProduceDataset(Dataset):
    """Dataset for produce images with segmentation masks"""
    
    def __init__(self, 
                 data_dir: str, 
                 transform=None, 
                 sam_model=None,
                 split: str = "train"):
        """
        Args:
            data_dir: Directory with produce images and annotations
            transform: Optional transform to be applied on images
            sam_model: SAM model for segmentation
            split: Dataset split (train, val, test)
        """
        self.data_dir = Path(data_dir)
        self.transform = transform
        self.sam_model = sam_model
        
        # Get all image paths
        self.samples = list((self.data_dir / split).glob('*/*.jpg'))
        
        # Map class names to indices
        self.classes = sorted([d.name for d in (self.data_dir / split).iterdir() 
                              if d.is_dir()])
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        
        # SAM transform for preprocessing
        if sam_model:
            self.sam_transform = ResizeLongestSide(sam_model.image_encoder.img_size)
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        img_path = self.samples[idx]
        class_name = img_path.parent.name
        label = self.class_to_idx[class_name]
        
        # Load image
        from PIL import Image
        image = Image.open(img_path).convert('RGB')
        
        # Generate mask using SAM if available
        mask = None
        if self.sam_model:
            # Convert PIL image to numpy array
            image_np = np.array(image)
            
            # Preprocess for SAM
            sam_image = self.sam_transform.apply_image(image_np)
            sam_image_tensor = torch.as_tensor(sam_image).permute(2, 0, 1).contiguous()
            
            # Generate mask
            masks = self.sam_model.generate(sam_image_tensor.unsqueeze(0))
            # Use the largest mask as the primary produce item
            if len(masks) > 0:
                # Sort masks by area (largest first)
                masks = sorted(masks, key=lambda x: x['area'], reverse=True)
                mask = masks[0]['segmentation']
        
        # Apply transforms
        if self.transform:
            image = self.transform(image)
            
            # Apply mask to image if available (focus on the produce)
            if mask is not None:
                # Resize mask to match transformed image
                mask = torch.from_numpy(mask).float()
                mask = torch.nn.functional.interpolate(
                    mask.unsqueeze(0).unsqueeze(0), 
                    size=image.shape[1:],
                    mode='nearest'
                ).squeeze(0).squeeze(0)
                
                # Apply mask to image (optional, depending on strategy)
                # Here we're just keeping the mask for future use
        
        return image, label, mask if mask is not None else torch.zeros(1)

def build_model(num_classes: int, pretrained: bool = True) -> nn.Module:
    """Build ConvNeXt-Large model with custom classifier head"""
    if pretrained:
        model = convnext_large(weights=ConvNeXt_Large_Weights.DEFAULT)
    else:
        model = convnext_large(weights=None)
    
    # Modify the classifier head
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    
    return model

def train_one_epoch(model, dataloader, criterion, optimizer, device):
    """Train model for one epoch"""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    for images, labels, _ in dataloader:
        images, labels = images.to(device), labels.to(device)
        
        optimizer.zero_grad()
        
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
    
    epoch_loss = running_loss / len(dataloader)
    epoch_acc = 100 * correct / total
    
    return epoch_loss, epoch_acc

def validate(model, dataloader, criterion, device):
    """Validate model on validation set"""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels, _ in dataloader:
            images, labels = images.to(device), labels.to(device)
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
    
    val_loss = running_loss / len(dataloader)
    val_acc = 100 * correct / total
    
    return val_loss, val_acc

def load_sam_model(model_type: str, checkpoint_path: str):
    """Load SAM model for segmentation"""
    sam = sam_model_registry[model_type](checkpoint=checkpoint_path)
    sam.to(device="cuda" if torch.cuda.is_available() else "cpu")
    mask_generator = SamAutomaticMaskGenerator(sam)
    return mask_generator

def main(args):
    """Main training function"""
    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Load SAM model
    sam_model = None
    if args.use_sam and args.sam_checkpoint:
        print("Loading SAM model for segmentation...")
        sam_model = load_sam_model("vit_h", args.sam_checkpoint)
    
    # Data transforms
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Create datasets and dataloaders
    train_dataset = ProduceDataset(
        data_dir=args.data_dir, 
        transform=train_transform, 
        sam_model=sam_model,
        split="train"
    )
    
    val_dataset = ProduceDataset(
        data_dir=args.data_dir, 
        transform=val_transform, 
        sam_model=sam_model,
        split="val"
    )
    
    train_loader = DataLoader(
        train_dataset, 
        batch_size=args.batch_size, 
        shuffle=True, 
        num_workers=args.num_workers
    )
    
    val_loader = DataLoader(
        val_dataset, 
        batch_size=args.batch_size, 
        shuffle=False, 
        num_workers=args.num_workers
    )
    
    print(f"Number of training samples: {len(train_dataset)}")
    print(f"Number of validation samples: {len(val_dataset)}")
    print(f"Number of classes: {len(train_dataset.classes)}")
    
    # Create model
    model = build_model(num_classes=len(train_dataset.classes), pretrained=True)
    model = model.to(device)
    
    # Loss function and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=args.learning_rate, weight_decay=args.weight_decay)
    
    # Learning rate scheduler
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-6)
    
    # Training loop
    best_val_acc = 0.0
    
    for epoch in range(1, args.epochs + 1):
        print(f"Epoch {epoch}/{args.epochs}")
        
        # Train
        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, device
        )
        
        # Validate
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        
        # Update scheduler
        scheduler.step()
        
        # Print metrics
        print(f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%")
        print(f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_acc': val_acc,
                'class_to_idx': train_dataset.class_to_idx,
            }, os.path.join(args.output_dir, 'best_model.pth'))
            print(f"New best model saved with validation accuracy: {val_acc:.2f}%")
    
    print("Training completed!")
    print(f"Best validation accuracy: {best_val_acc:.2f}%")
    
    # Save final model
    torch.save({
        'epoch': args.epochs,
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'val_acc': val_acc,
        'class_to_idx': train_dataset.class_to_idx,
    }, os.path.join(args.output_dir, 'final_model.pth'))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Produce Recognition Training Script")
    parser.add_argument("--data_dir", type=str, required=True, help="Path to dataset directory")
    parser.add_argument("--output_dir", type=str, default="./output", help="Output directory for saved models")
    parser.add_argument("--batch_size", type=int, default=16, help="Batch size")
    parser.add_argument("--epochs", type=int, default=20, help="Number of epochs")
    parser.add_argument("--learning_rate", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--weight_decay", type=float, default=1e-4, help="Weight decay")
    parser.add_argument("--num_workers", type=int, default=4, help="Number of workers for data loading")
    parser.add_argument("--use_sam", action="store_true", help="Whether to use SAM for segmentation")
    parser.add_argument("--sam_checkpoint", type=str, default=None, help="Path to SAM checkpoint")
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    main(args)
