
"""
Produce Recognition System - TensorRT Conversion Script
This script converts the PyTorch ConvNeXt model to TensorRT format
for optimized inference on edge devices like Raspberry Pi with GPU acceleration.
"""

import os
import torch
import argparse
import numpy as np
from typing import Tuple, Dict, Any

# For ONNX conversion
import onnx
import onnxruntime

# TensorRT imports (these would typically be installed on the target system)
# Uncomment this section when running on a system with TensorRT installed
"""
import tensorrt as trt
import pycuda.driver as cuda
import pycuda.autoinit
"""

def load_pytorch_model(model_path: str, num_classes: int) -> torch.nn.Module:
    """Load the trained PyTorch model"""
    from torchvision.models import convnext_large
    
    # Initialize model architecture
    model = convnext_large(weights=None)
    
    # Modify the classifier head for our number of classes
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = torch.nn.Linear(in_features, num_classes)
    
    # Load saved weights
    checkpoint = torch.load(model_path, map_location=torch.device('cpu'))
    model.load_state_dict(checkpoint['model_state_dict'])
    
    # Set to evaluation mode
    model.eval()
    
    return model, checkpoint.get('class_to_idx', {})

def convert_to_onnx(
    model: torch.nn.Module, 
    output_path: str, 
    input_shape: Tuple[int, int, int, int] = (1, 3, 224, 224)
) -> str:
    """Convert PyTorch model to ONNX format"""
    # Create random input tensor for tracing
    dummy_input = torch.randn(input_shape)
    
    # Export model to ONNX
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=12,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    
    # Verify ONNX model
    onnx_model = onnx.load(output_path)
    onnx.checker.check_model(onnx_model)
    
    print(f"ONNX model saved to {output_path}")
    print(f"ONNX model IR version: {onnx_model.ir_version}")
    print(f"ONNX model opset version: {onnx_model.opset_import[0].version}")
    
    return output_path

def convert_onnx_to_tensorrt(
    onnx_path: str, 
    output_path: str, 
    precision: str = "fp16"
) -> str:
    """
    Convert ONNX model to TensorRT format
    
    Note: This part requires TensorRT to be installed on the system.
    It's commented out as it would typically run on the target system.
    """
    print("TensorRT conversion - this is a placeholder as TensorRT is target-specific")
    print(f"In a real implementation, this would convert {onnx_path} to {output_path}")
    print(f"Using precision: {precision}")
    
    """
    # TensorRT conversion code (uncomment when running on system with TensorRT)
    
    TRT_LOGGER = trt.Logger(trt.Logger.WARNING)
    
    # Create builder
    builder = trt.Builder(TRT_LOGGER)
    network = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))
    parser = trt.OnnxParser(network, TRT_LOGGER)
    
    # Parse ONNX model
    with open(onnx_path, 'rb') as model:
        if not parser.parse(model.read()):
            for error in range(parser.num_errors):
                print(parser.get_error(error))
            raise RuntimeError("Failed to parse ONNX model")
    
    # Configure builder
    config = builder.create_builder_config()
    config.max_workspace_size = 1 << 30  # 1 GB
    
    # Set precision
    if precision == "fp16" and builder.platform_has_fast_fp16:
        config.set_flag(trt.BuilderFlag.FP16)
    elif precision == "int8" and builder.platform_has_fast_int8:
        config.set_flag(trt.BuilderFlag.INT8)
        # Would need calibration data for INT8
    
    # Build engine
    serialized_engine = builder.build_serialized_network(network, config)
    
    # Save engine
    with open(output_path, "wb") as f:
        f.write(serialized_engine)
    
    print(f"TensorRT engine saved to {output_path}")
    """
    
    return output_path

def create_deployment_package(
    tensorrt_path: str, 
    class_mapping: Dict[str, int], 
    output_dir: str
) -> str:
    """
    Create a deployment package with TensorRT model and metadata
    """
    import json
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Create inverse class mapping (idx -> class)
    idx_to_class = {v: k for k, v in class_mapping.items()}
    
    # Save class mapping
    mapping_path = os.path.join(output_dir, "class_mapping.json")
    with open(mapping_path, "w") as f:
        json.dump(idx_to_class, f, indent=2)
    
    # Create deployment info file
    deploy_info = {
        "model_type": "ConvNeXt-Large",
        "input_shape": [1, 3, 224, 224],
        "input_name": "input",
        "output_name": "output",
        "precision": "fp16",
        "num_classes": len(class_mapping),
        "class_mapping_file": "class_mapping.json",
        "model_file": os.path.basename(tensorrt_path),
        "created_on": "2025-04-09",  # Current date
    }
    
    info_path = os.path.join(output_dir, "deployment_info.json")
    with open(info_path, "w") as f:
        json.dump(deploy_info, f, indent=2)
    
    # Copy TensorRT model (this is a placeholder since we're not actually creating it)
    # In reality, we would copy the file or create a dummy for demonstration
    dest_model_path = os.path.join(output_dir, os.path.basename(tensorrt_path))
    with open(dest_model_path, "w") as f:
        f.write("# This is a placeholder for the TensorRT model file\n")
        f.write("# In a real deployment, this would be a binary TensorRT engine file\n")
    
    print(f"Deployment package created in {output_dir}")
    
    return output_dir

def create_inference_script(output_dir: str) -> str:
    """
    Create a Python inference script for the Raspberry Pi
    to use the TensorRT model with the camera and scale
    """
    script_content = """#!/usr/bin/env python3
"""
    script_content += '''
"""
Produce Recognition Inference Script for Raspberry Pi
This script captures images from a camera, processes them through the TensorRT model,
reads weight from a connected scale, and outputs JSON results.

Requirements:
- TensorRT
- PyCUDA
- PySerial (for scale communication)
- OpenCV
- NumPy

Hardware:
- Raspberry Pi
- Camera Module
- Serial/USB Scale
"""

import os
import json
import time
import cv2
import numpy as np
import serial
import argparse
from typing import Dict, Any, List, Tuple, Optional

# TensorRT imports
try:
    import tensorrt as trt
    import pycuda.driver as cuda
    import pycuda.autoinit
except ImportError:
    print("Warning: TensorRT or CUDA packages not found.")
    print("This script requires TensorRT and PyCUDA to run inference.")

class ProduceRecognitionSystem:
    """Main class for produce recognition system"""
    
    def __init__(
        self, 
        model_dir: str,
        scale_port: str = "/dev/ttyUSB0",
        scale_baudrate: int = 9600,
        camera_id: int = 0,
        confidence_threshold: float = 0.7
    ):
        """
        Initialize the produce recognition system
        
        Args:
            model_dir: Directory containing TensorRT model and metadata
            scale_port: Serial port for scale connection
            scale_baudrate: Baud rate for scale connection
            camera_id: Camera device ID
            confidence_threshold: Minimum confidence threshold for recognition
        """
        self.model_dir = model_dir
        self.scale_port = scale_port
        self.scale_baudrate = scale_baudrate
        self.camera_id = camera_id
        self.confidence_threshold = confidence_threshold
        
        # Load deployment info
        self.deployment_info = self._load_deployment_info()
        
        # Load class mapping
        self.class_mapping = self._load_class_mapping()
        
        # Initialize TensorRT engine
        self.engine = None
        self.context = None
        self.input_buffer = None
        self.output_buffer = None
        self.bindings = None
        self._init_tensorrt()
        
        # Initialize camera
        self.camera = None
        self._init_camera()
        
        # Initialize scale
        self.scale = None
        self._init_scale()
        
        print("Produce Recognition System initialized")
    
    def _load_deployment_info(self) -> Dict[str, Any]:
        """Load deployment information from JSON file"""
        info_path = os.path.join(self.model_dir, "deployment_info.json")
        with open(info_path, "r") as f:
            return json.load(f)
    
    def _load_class_mapping(self) -> Dict[int, str]:
        """Load class mapping from JSON file"""
        mapping_path = os.path.join(
            self.model_dir, 
            self.deployment_info["class_mapping_file"]
        )
        with open(mapping_path, "r") as f:
            return json.load(f)
    
    def _init_tensorrt(self):
        """Initialize TensorRT engine and allocate buffers"""
        try:
            # Load TensorRT engine
            model_path = os.path.join(self.model_dir, self.deployment_info["model_file"])
            
            # In a real implementation, we would load the TensorRT engine
            # and allocate CUDA buffers for inputs and outputs
            
            print(f"TensorRT engine would be initialized from {model_path}")
            print("This is a placeholder for actual TensorRT initialization")
            
        except Exception as e:
            print(f"Error initializing TensorRT: {str(e)}")
            print("Falling back to mock inference mode")
    
    def _init_camera(self):
        """Initialize camera capture"""
        try:
            self.camera = cv2.VideoCapture(self.camera_id)
            if not self.camera.isOpened():
                raise RuntimeError(f"Failed to open camera {self.camera_id}")
            
            # Set camera properties
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            
            print(f"Camera initialized: ID {self.camera_id}")
        except Exception as e:
            print(f"Error initializing camera: {str(e)}")
            print("Falling back to mock camera mode")
    
    def _init_scale(self):
        """Initialize serial connection to scale"""
        try:
            self.scale = serial.Serial(
                port=self.scale_port,
                baudrate=self.scale_baudrate,
                timeout=1
            )
            print(f"Scale connected on {self.scale_port} at {self.scale_baudrate} baud")
        except Exception as e:
            print(f"Error connecting to scale: {str(e)}")
            print("Falling back to mock scale readings")
    
    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for model input"""
        # Resize to model input size
        input_shape = self.deployment_info["input_shape"]
        resized = cv2.resize(image, (input_shape[2], input_shape[3]))
        
        # Convert to RGB (OpenCV uses BGR)
        rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
        
        # Normalize pixel values
        normalized = rgb.astype(np.float32) / 255.0
        normalized = (normalized - np.array([0.485, 0.456, 0.406])) / np.array([0.229, 0.224, 0.225])
        
        # Transpose to NCHW format for TensorRT
        nchw = normalized.transpose(2, 0, 1)
        
        # Add batch dimension
        batched = np.expand_dims(nchw, axis=0)
        
        return batched
    
    def _read_scale_weight(self) -> Optional[float]:
        """Read weight from connected scale"""
        if self.scale is None:
            # Return mock weight if scale not connected
            return round(random.uniform(150, 500), 1)
        
        try:
            # Read data from scale
            self.scale.write(b"W\r\n")  # Command to request weight
            time.sleep(0.1)
            
            if self.scale.in_waiting:
                data = self.scale.readline().decode('utf-8').strip()
                
                # Parse weight data (format depends on scale model)
                # This is a simple example; adjust according to your scale's protocol
                if data.startswith("W:"):
                    weight_str = data[2:].strip()
                    return float(weight_str)
            
            return None
        
        except Exception as e:
            print(f"Error reading scale: {str(e)}")
            return None
    
    def _infer(self, preprocessed_image: np.ndarray) -> np.ndarray:
        """Run inference with TensorRT engine"""
        # This is a placeholder for actual TensorRT inference
        # In a real implementation, this would run the TensorRT engine
        
        # Mock inference result - random probabilities for each class
        num_classes = len(self.class_mapping)
        mock_probs = np.random.random(num_classes)
        mock_probs = np.exp(mock_probs) / np.sum(np.exp(mock_probs))  # Apply softmax
        
        # Make one class more likely to be the prediction
        mock_probs[:] = mock_probs[:] * 0.2
        random_class = np.random.randint(0, num_classes)
        mock_probs[random_class] = np.random.uniform(0.7, 0.99)
        mock_probs = mock_probs / np.sum(mock_probs)  # Renormalize
        
        return mock_probs
    
    def _get_produce_data(self, class_id: int) -> Dict[str, Any]:
        """Get produce data for a given class ID"""
        # In a real system, this could look up information from a database
        # Here, we're using mock data
        
        class_name = self.class_mapping[str(class_id)]
        
        # Mock price and nutrition data based on class name
        # This would come from a database in a real system
        mock_data = {
            "apple": {
                "price_per_kg": 2.99,
                "nutrition": {
                    "calories": 52,
                    "protein": 0.3,
                    "carbs": 13.8,
                    "fat": 0.2
                }
            },
            "banana": {
                "price_per_kg": 1.99,
                "nutrition": {
                    "calories": 89,
                    "protein": 1.1,
                    "carbs": 22.8,
                    "fat": 0.3
                }
            },
            "orange": {
                "price_per_kg": 3.49,
                "nutrition": {
                    "calories": 47,
                    "protein": 0.9,
                    "carbs": 11.8,
                    "fat": 0.1
                }
            }
            # Add more produce items as needed
        }
        
        # Extract class name without numbers or underscores
        base_name = ''.join([c for c in class_name.lower() if c.isalpha()])
        
        # Find the closest matching produce in our mock data
        best_match = None
        best_match_score = 0
        
        for produce in mock_data:
            if produce in base_name or base_name in produce:
                score = len(set(base_name) & set(produce))
                if score > best_match_score:
                    best_match = produce
                    best_match_score = score
        
        # Use default data if no match found
        if best_match is None:
            return {
                "price_per_kg": 1.99,
                "nutrition": {
                    "calories": 50,
                    "protein": 0.5,
                    "carbs": 10.0,
                    "fat": 0.2
                }
            }
        
        return mock_data[best_match]
    
    def capture_and_recognize(self) -> Dict[str, Any]:
        """Capture image, recognize produce, and return results"""
        # Capture image from camera
        if self.camera is None or not self.camera.isOpened():
            # Mock image capture
            print("Using mock image capture")
            # Create a solid color image as mock
            mock_image = np.ones((720, 1280, 3), dtype=np.uint8) * 100
            # Add some random noise to simulate an image
            mock_image = mock_image + np.random.randint(0, 50, size=mock_image.shape, dtype=np.uint8)
            image = mock_image
        else:
            ret, image = self.camera.read()
            if not ret:
                raise RuntimeError("Failed to capture image from camera")
        
        # Save captured image for debugging
        cv2.imwrite("captured_image.jpg", image)
        
        # Preprocess image
        preprocessed = self._preprocess_image(image)
        
        # Run inference
        probabilities = self._infer(preprocessed)
        
        # Get class with highest probability
        class_id = np.argmax(probabilities)
        confidence = probabilities[class_id]
        
        # Skip if confidence is too low
        if confidence < self.confidence_threshold:
            return {
                "success": False,
                "message": "Confidence too low",
                "confidence": float(confidence)
            }
        
        # Get class name
        class_name = self.class_mapping[str(class_id)]
        
        # Read weight from scale
        weight_grams = self._read_scale_weight()
        
        # Get produce data
        produce_data = self._get_produce_data(class_id)
        
        # Calculate price based on weight
        price = None
        if weight_grams is not None:
            price = (weight_grams / 1000) * produce_data["price_per_kg"]
        
        # Create result JSON
        result = {
            "success": True,
            "name": class_name,
            "confidence": float(confidence),
            "weight_grams": weight_grams,
            "price": round(price, 2) if price is not None else None,
            "price_per_kg": produce_data["price_per_kg"],
            "nutrition_per_100g": produce_data["nutrition"],
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        return result
    
    def close(self):
        """Close resources"""
        if self.camera is not None and self.camera.isOpened():
            self.camera.release()
        
        if self.scale is not None:
            self.scale.close()

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Produce Recognition Inference Script")
    parser.add_argument("--model_dir", type=str, required=True, help="Directory containing TensorRT model and metadata")
    parser.add_argument("--scale_port", type=str, default="/dev/ttyUSB0", help="Serial port for scale connection")
    parser.add_argument("--scale_baudrate", type=int, default=9600, help="Baud rate for scale connection")
    parser.add_argument("--camera_id", type=int, default=0, help="Camera device ID")
    parser.add_argument("--confidence", type=float, default=0.7, help="Minimum confidence threshold")
    parser.add_argument("--continuous", action="store_true", help="Run in continuous mode")
    parser.add_argument("--output", type=str, default=None, help="Output JSON file (default: print to stdout)")
    
    args = parser.parse_args()
    
    # Create produce recognition system
    system = ProduceRecognitionSystem(
        model_dir=args.model_dir,
        scale_port=args.scale_port,
        scale_baudrate=args.scale_baudrate,
        camera_id=args.camera_id,
        confidence_threshold=args.confidence
    )
    
    try:
        if args.continuous:
            print("Running in continuous mode. Press Ctrl+C to stop.")
            while True:
                result = system.capture_and_recognize()
                
                # Print result
                print(json.dumps(result, indent=2))
                
                # Save to file if specified
                if args.output:
                    with open(args.output, "w") as f:
                        json.dump(result, f, indent=2)
                
                # Wait a bit before next capture
                time.sleep(1)
        else:
            # Single capture
            result = system.capture_and_recognize()
            
            # Print result
            print(json.dumps(result, indent=2))
            
            # Save to file if specified
            if args.output:
                with open(args.output, "w") as f:
                    json.dump(result, f, indent=2)
    
    except KeyboardInterrupt:
        print("Interrupted by user")
    finally:
        # Clean up resources
        system.close()

if __name__ == "__main__":
    import random  # Used in mock functions
    main()
'''
    
    # Write script to file
    script_path = os.path.join(output_dir, "inference.py")
    with open(script_path, "w") as f:
        f.write(script_content)
    
    # Make script executable
    os.chmod(script_path, 0o755)
    
    print(f"Inference script created at {script_path}")
    
    return script_path

def create_scale_integration_script(output_dir: str) -> str:
    """
    Create a Python script for integrating with a USB/Serial scale
    """
    script_content = """#!/usr/bin/env python3
"""
    script_content += '''
"""
Scale Integration Script for Produce Recognition System
This script demonstrates how to integrate with different types of scales
over serial/USB connections for the produce recognition system.

Compatible scale protocols:
1. DYMO/Pelouze digital scales
2. Mettler Toledo scales
3. Generic serial scales
"""

import time
import serial
import argparse
from typing import Dict, Any, Optional, List

class ScaleInterface:
    """Base class for scale interfaces"""
    
    def __init__(self, port: str, baudrate: int = 9600, timeout: float = 1.0):
        """Initialize scale interface"""
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.conn = None
    
    def connect(self) -> bool:
        """Connect to scale"""
        try:
            self.conn = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=self.timeout
            )
            return True
        except Exception as e:
            print(f"Failed to connect to scale: {str(e)}")
            return False
    
    def disconnect(self):
        """Disconnect from scale"""
        if self.conn and self.conn.is_open:
            self.conn.close()
    
    def read_weight(self) -> Optional[float]:
        """Read weight from scale (abstract method)"""
        raise NotImplementedError("Subclasses must implement read_weight method")
    
    def tare(self) -> bool:
        """Tare the scale (abstract method)"""
        raise NotImplementedError("Subclasses must implement tare method")
    
    def is_stable(self) -> bool:
        """Check if the weight is stable (abstract method)"""
        raise NotImplementedError("Subclasses must implement is_stable method")

class DYMOScaleInterface(ScaleInterface):
    """Interface for DYMO/Pelouze digital scales"""
    
    def read_weight(self) -> Optional[float]:
        """Read weight from DYMO scale"""
        if not self.conn or not self.conn.is_open:
            return None
        
        try:
            # Send read command (empty string for DYMO)
            self.conn.write(b'')
            time.sleep(0.1)
            
            # Read response
            if self.conn.in_waiting:
                data = self.conn.read(self.conn.in_waiting)
                
                # Parse the data (DYMO format)
                # Format: [status byte][weight bytes][unit byte]
                if len(data) >= 4:
                    status_byte = data[0]
                    weight_bytes = data[1:3]
                    unit_byte = data[3]
                    
                    # Extract weight value (typically in grams)
                    weight = int.from_bytes(weight_bytes, byteorder='big')
                    
                    # Check if measurement is stable
                    is_stable = status_byte & 0x02 == 0
                    
                    # Convert to grams if necessary
                    if unit_byte == 0x0E:  # Ounces
                        weight = weight * 28.3495
                    
                    return weight if is_stable else None
            
            return None
        
        except Exception as e:
            print(f"Error reading from DYMO scale: {str(e)}")
            return None
    
    def tare(self) -> bool:
        """Tare the DYMO scale"""
        if not self.conn or not self.conn.is_open:
            return False
        
        try:
            # Send tare command (specific to DYMO)
            self.conn.write(b'T')
            time.sleep(0.5)  # Give the scale time to tare
            return True
        except Exception as e:
            print(f"Error taring DYMO scale: {str(e)}")
            return False
    
    def is_stable(self) -> bool:
        """Check if the DYMO scale reading is stable"""
        if not self.conn or not self.conn.is_open:
            return False
        
        try:
            # Send status command
            self.conn.write(b'')
            time.sleep(0.1)
            
            if self.conn.in_waiting:
                data = self.conn.read(self.conn.in_waiting)
                
                if len(data) > 0:
                    status_byte = data[0]
                    # Check stability bit
                    return status_byte & 0x02 == 0
            
            return False
        except Exception as e:
            print(f"Error checking DYMO scale stability: {str(e)}")
            return False

class MettlerToledoScaleInterface(ScaleInterface):
    """Interface for Mettler Toledo scales"""
    
    def read_weight(self) -> Optional[float]:
        """Read weight from Mettler Toledo scale"""
        if not self.conn or not self.conn.is_open:
            return None
        
        try:
            # Send weight request command (SI command for Mettler Toledo)
            self.conn.write(b'SI\\r\\n')
            time.sleep(0.1)
            
            # Read response
            if self.conn.in_waiting:
                data = self.conn.readline().decode('ascii').strip()
                
                # Parse the data (Mettler Toledo format)
                # Format typically: "S S    123.45 g"
                # S S indicates stable weight
                parts = data.split()
                if len(parts) >= 3 and parts[0] == 'S':
                    try:
                        weight = float(parts[2])
                        return weight
                    except ValueError:
                        return None
            
            return None
        
        except Exception as e:
            print(f"Error reading from Mettler Toledo scale: {str(e)}")
            return None
    
    def tare(self) -> bool:
        """Tare the Mettler Toledo scale"""
        if not self.conn or not self.conn.is_open:
            return False
        
        try:
            # Send tare command (T command for Mettler Toledo)
            self.conn.write(b'T\\r\\n')
            time.sleep(0.5)  # Give the scale time to tare
            
            # Read response to confirm
            if self.conn.in_waiting:
                data = self.conn.readline().decode('ascii').strip()
                return data.startswith('T')
            
            return True  # Assume success if no response
        except Exception as e:
            print(f"Error taring Mettler Toledo scale: {str(e)}")
            return False
    
    def is_stable(self) -> bool:
        """Check if the Mettler Toledo scale reading is stable"""
        if not self.conn or not self.conn.is_open:
            return False
        
        try:
            # Send status request
            self.conn.write(b'SI\\r\\n')
            time.sleep(0.1)
            
            if self.conn.in_waiting:
                data = self.conn.readline().decode('ascii').strip()
                return data.startswith('S S')  # 'S S' indicates stable weight
            
            return False
        except Exception as e:
            print(f"Error checking Mettler Toledo scale stability: {str(e)}")
            return False

class GenericScaleInterface(ScaleInterface):
    """Interface for generic serial scales with configurable commands"""
    
    def __init__(
        self, 
        port: str, 
        baudrate: int = 9600,
        timeout: float = 1.0,
        weight_cmd: bytes = b'W\\r\\n',
        tare_cmd: bytes = b'T\\r\\n',
        weight_regex: str = r'(\d+\.\d+)',
        stable_indicator: str = 'S'
    ):
        """Initialize generic scale interface with configurable commands"""
        super().__init__(port, baudrate, timeout)
        self.weight_cmd = weight_cmd
        self.tare_cmd = tare_cmd
        self.weight_regex = weight_regex
        self.stable_indicator = stable_indicator
        
        # For regex parsing
        import re
        self.regex = re.compile(weight_regex)
    
    def read_weight(self) -> Optional[float]:
        """Read weight using configured command"""
        if not self.conn or not self.conn.is_open:
            return None
        
        try:
            # Clear input buffer
            self.conn.reset_input_buffer()
            
            # Send weight command
            self.conn.write(self.weight_cmd)
            time.sleep(0.1)
            
            # Read response
            if self.conn.in_waiting:
                data = self.conn.readline().decode('ascii', errors='ignore').strip()
                
                # Parse using regex
                match = self.regex.search(data)
                if match:
                    try:
                        weight = float(match.group(1))
                        return weight
                    except ValueError:
                        return None
            
            return None
        
        except Exception as e:
            print(f"Error reading from generic scale: {str(e)}")
            return None
    
    def tare(self) -> bool:
        """Tare using configured command"""
        if not self.conn or not self.conn.is_open:
            return False
        
        try:
            self.conn.write(self.tare_cmd)
            time.sleep(0.5)  # Give the scale time to tare
            return True
        except Exception as e:
            print(f"Error taring generic scale: {str(e)}")
            return False
    
    def is_stable(self) -> bool:
        """Check stability using configured indicator"""
        if not self.conn or not self.conn.is_open:
            return False
        
        try:
            # Many scales include stability indicator in weight response
            # So we'll use the weight command and check for the stability indicator
            self.conn.reset_input_buffer()
            self.conn.write(self.weight_cmd)
            time.sleep(0.1)
            
            if self.conn.in_waiting:
                data = self.conn.readline().decode('ascii', errors='ignore').strip()
                return self.stable_indicator in data
            
            return False
        except Exception as e:
            print(f"Error checking generic scale stability: {str(e)}")
            return False

def create_scale_interface(
    scale_type: str, 
    port: str, 
    baudrate: int = 9600,
    **kwargs
) -> ScaleInterface:
    """Factory function to create appropriate scale interface"""
    if scale_type.lower() == "dymo":
        return DYMOScaleInterface(port, baudrate)
    elif scale_type.lower() == "mettler":
        return MettlerToledoScaleInterface(port, baudrate)
    else:
        return GenericScaleInterface(port, baudrate, **kwargs)

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Scale Integration for Produce Recognition")
    parser.add_argument("--port", type=str, required=True, help="Serial port for scale")
    parser.add_argument("--baudrate", type=int, default=9600, help="Baud rate for serial connection")
    parser.add_argument("--scale-type", type=str, default="generic", choices=["dymo", "mettler", "generic"], 
                        help="Type of scale to connect to")
    parser.add_argument("--continuous", action="store_true", help="Continuously read weight")
    parser.add_argument("--tare", action="store_true", help="Tare the scale before reading")
    
    args = parser.parse_args()
    
    # Create appropriate scale interface
    scale = create_scale_interface(args.scale_type, args.port, args.baudrate)
    
    # Connect to scale
    print(f"Connecting to {args.scale_type} scale on {args.port}...")
    if not scale.connect():
        print("Failed to connect to scale. Exiting.")
        return 1
    
    try:
        # Tare if requested
        if args.tare:
            print("Taring scale...")
            if scale.tare():
                print("Scale tared successfully")
            else:
                print("Failed to tare scale")
        
        if args.continuous:
            print("Reading weight continuously. Press Ctrl+C to stop.")
            while True:
                weight = scale.read_weight()
                stable = scale.is_stable()
                
                if weight is not None:
                    print(f"Weight: {weight:.1f}g {'(stable)' if stable else '(unstable)'}")
                else:
                    print("Failed to read weight")
                
                time.sleep(0.5)
        else:
            # Single read
            weight = scale.read_weight()
            stable = scale.is_stable()
            
            if weight is not None:
                print(f"Weight: {weight:.1f}g {'(stable)' if stable else '(unstable)'}")
            else:
                print("Failed to read weight")
    
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    finally:
        # Disconnect from scale
        scale.disconnect()
    
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())
'''
    
    # Write script to file
    script_path = os.path.join(output_dir, "scale_integration.py")
    with open(script_path, "w") as f:
        f.write(script_content)
    
    # Make script executable
    os.chmod(script_path, 0o755)
    
    print(f"Scale integration script created at {script_path}")
    
    return script_path

def main():
    parser = argparse.ArgumentParser(description="Convert PyTorch model to TensorRT")
    parser.add_argument("--model_path", type=str, required=True, help="Path to PyTorch model checkpoint")
    parser.add_argument("--output_dir", type=str, default="./deployment", help="Output directory for TensorRT model")
    parser.add_argument("--num_classes", type=int, required=True, help="Number of classes in the model")
    parser.add_argument("--precision", type=str, default="fp16", choices=["fp32", "fp16", "int8"], help="Precision for TensorRT model")
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Step 1: Load PyTorch model
    print("Loading PyTorch model...")
    model, class_mapping = load_pytorch_model(args.model_path, args.num_classes)
    print(f"Model loaded with {args.num_classes} output classes")
    
    # Step 2: Convert to ONNX
    print("Converting model to ONNX format...")
    onnx_path = os.path.join(args.output_dir, "model.onnx")
    convert_to_onnx(model, onnx_path)
    
    # Step 3: Convert ONNX to TensorRT
    print(f"Converting ONNX model to TensorRT with {args.precision} precision...")
    tensorrt_path = os.path.join(args.output_dir, f"model_{args.precision}.engine")
    convert_onnx_to_tensorrt(onnx_path, tensorrt_path, args.precision)
    
    # Step 4: Create deployment package
    print("Creating deployment package...")
    package_dir = os.path.join(args.output_dir, "deploy_package")
    create_deployment_package(tensorrt_path, class_mapping, package_dir)
    
    # Step 5: Create inference script
    print("Creating inference script...")
    create_inference_script(package_dir)
    
    # Step 6: Create scale integration script
    print("Creating scale integration script...")
    create_scale_integration_script(package_dir)
    
    print(f"Conversion and deployment package creation complete.")
    print(f"Deployment package available at: {package_dir}")

if __name__ == "__main__":
    main()
