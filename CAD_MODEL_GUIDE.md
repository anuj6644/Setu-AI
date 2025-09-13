# CAD Model Integration Guide - Setu AI

## 📋 **Overview**
Your GLB file has been successfully integrated into the simulation! The system now supports:
- ✅ **Your CAD Model**: `bridge.glb` (1.5MB)
- ✅ **Automatic Fallback**: If model fails to load
- ✅ **Real-time Animation**: Based on sensor data
- ✅ **Material Color Changes**: Visual status indicators

## 🌐 **Access Your CAD Simulation**
- **URL**: `http://localhost:8081/cad-simulation`
- **Navigation**: Click "CAD Model" in the top menu

## 🎯 **Features Implemented**

### **1. CAD Model Loading**
- Loads your `bridge.glb` file from `/public/bridge.glb`
- Automatic preloading for faster initial display
- Error handling with fallback to geometric bridge
- Memory-efficient cloning to avoid conflicts

### **2. Real-time Animations**
- **Vibration Effects**: Model moves based on vibration sensor data
- **Strain Visualization**: Color changes from green → yellow → red
- **Material Updates**: Both emissive and diffuse color changes
- **Subtle Movements**: Appropriate for CAD models

### **3. Interactive Controls**
- 🖱️ **Mouse Controls**: Orbit, zoom, pan
- ⏸️ **Pause/Resume**: Control simulation
- 🔄 **Reset**: Return to normal values
- 🔄 **Reload Model**: Force model refresh

### **4. Visual Enhancements**
- **Professional Lighting**: Multiple light sources
- **Ground Plane**: Realistic foundation
- **Grid Reference**: For scale understanding
- **Shadows**: Depth perception (if supported)

## 🛠️ **Model Configuration**

### **Current Settings**
```typescript
// Model positioning and scaling
<primitive 
  object={clonedScene} 
  scale={0.1}           // 10% of original size
  position={[0, -2, 0]} // Slightly below center
/>

// Camera position
camera={{ position: [10, 6, 10], fov: 50 }}
```

### **Adjusting Your Model**

#### **1. Scale Adjustment**
If your model appears too large/small, modify the scale:
```typescript
scale={0.05}  // Smaller (5% of original)
scale={0.2}   // Larger (20% of original)
```

#### **2. Position Adjustment**
To reposition your model:
```typescript
position={[x, y, z]}
// x: left(-)/right(+)
// y: down(-)/up(+)  
// z: back(-)/forward(+)
```

#### **3. Rotation Adjustment**
If your model needs rotation:
```typescript
<primitive 
  object={clonedScene} 
  scale={0.1}
  position={[0, -2, 0]}
  rotation={[0, Math.PI/4, 0]} // Rotate 45° around Y-axis
/>
```

## 🎨 **Material & Animation Settings**

### **Color Intensity**
Adjust how much the color changes based on strain:
```typescript
// Current: 20% blend with status color
material.color.copy(originalColor).lerp(color, 0.2);

// More dramatic: 50% blend
material.color.copy(originalColor).lerp(color, 0.5);
```

### **Animation Intensity**
Adjust vibration and movement:
```typescript
// Vibration (current: 0.02)
groupRef.current.position.y = Math.sin(time * 2) * vibration * 0.02;

// More subtle: 0.01
// More dramatic: 0.05
```

## 📊 **Performance Optimization**

### **Your Model Stats**
- **File Size**: 1.56 MB (Good for web)
- **Format**: GLB (Optimized)
- **Loading**: ~1-3 seconds on average connection

### **If You Need to Optimize Further**
1. **Reduce Texture Size**: Use 1024x1024 instead of 2048x2048
2. **Simplify Geometry**: Reduce polygon count if very detailed
3. **Compress Textures**: Use WebP format in Blender
4. **Remove Unused Materials**: Clean up before export

## 🔧 **Customization Options**

### **Adding More Models**
To add additional GLB files:
1. Place them in `/public/` folder
2. Update the component:
```typescript
const modelPath = "/your-model.glb";
gltf = useGLTF(modelPath);
```

### **Multiple Model Views**
Create buttons to switch between models:
```typescript
const [currentModel, setCurrentModel] = useState("bridge.glb");

const models = {
  bridge: "/bridge.glb",
  building: "/building.glb",
  tower: "/tower.glb"
};
```

### **Model Variants**
Show different damage states:
```typescript
const getModelPath = (strain: number) => {
  if (strain < 1000) return "/bridge-normal.glb";
  if (strain < 2000) return "/bridge-stressed.glb";
  return "/bridge-damaged.glb";
};
```

## 🚨 **Troubleshooting**

### **Model Not Loading**
1. **Check File Path**: Ensure `/public/bridge.glb` exists
2. **Check Console**: Look for loading errors
3. **File Corruption**: Re-export from your CAD software
4. **Size Limit**: Some servers have upload limits

### **Model Appears Wrong**
1. **Scale Issues**: Adjust `scale` property
2. **Orientation**: Add `rotation` property
3. **Position**: Modify `position` property
4. **Materials**: Check if materials are embedded

### **Performance Issues**
1. **Reduce Model Complexity**: Simplify geometry
2. **Optimize Textures**: Reduce texture resolution
3. **Disable Shadows**: Comment out shadow settings
4. **Lower Update Rate**: Increase interval time

## 🎯 **Best Practices**

### **CAD Model Preparation**
1. **Units**: Use consistent units (preferably meters)
2. **Origin**: Place model at origin (0,0,0)
3. **Materials**: Ensure materials are properly applied
4. **Textures**: Embed textures in GLB file
5. **Optimization**: Use Blender's GLB export settings

### **File Organization**
```
public/
├── bridge.glb          // Your main model
├── bridge-damaged.glb  // Damaged state (optional)
├── building.glb        // Additional models
└── textures/           // External textures (if any)
```

## 🚀 **Next Steps**

1. **Test Your Model**: Visit `/cad-simulation`
2. **Adjust Settings**: Modify scale/position as needed
3. **Add More Models**: Include different infrastructure types
4. **Enhance Animations**: Add more sophisticated effects
5. **Integrate Sensors**: Connect real sensor data

## 📞 **Support**

If your model doesn't display correctly:
1. Check the browser console for errors
2. Verify the file path is correct
3. Ensure the GLB file is valid
4. Try the fallback geometric bridge first

Your CAD model integration is now ready for real-time infrastructure monitoring! 🎉
