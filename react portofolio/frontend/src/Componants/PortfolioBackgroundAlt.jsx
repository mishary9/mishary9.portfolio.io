import React, { useEffect, useState, useRef } from 'react';

const PortfolioBackgroundAlt = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const animationFrameRef = useRef(null);
  const gradientRef = useRef(null);
  const timeRef = useRef(0);

  // Setup canvas and context
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const context = canvas.getContext('2d');
    contextRef.current = context;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createGradient();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Create gradient
  const createGradient = () => {
    if (!contextRef.current) return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    // Create a vibrant gradient
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f172a'); // Dark blue
    gradient.addColorStop(0.3, '#1e293b'); // Slate
    gradient.addColorStop(0.6, '#1e1b4b'); // Deep indigo
    gradient.addColorStop(1, '#0f172a'); // Dark blue
    
    gradientRef.current = gradient;
  };

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop
  useEffect(() => {
    createGradient();
    
    const draw = () => {
      if (!contextRef.current || !canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const context = contextRef.current;
      const time = timeRef.current;
      
      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      context.fillStyle = gradientRef.current;
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw geometric shapes
      drawShapes(context, canvas, time);
      
      // Increment time
      timeRef.current += 0.005;
      
      // Request next frame
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Draw geometric shapes
  const drawShapes = (context, canvas, time) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Get mouse influence (normalized from -1 to 1)
    const mouseXNorm = (mousePosition.x / canvas.width) * 2 - 1;
    const mouseYNorm = (mousePosition.y / canvas.height) * 2 - 1;
    
    // Draw floating geometric shapes
    const shapes = 12;
    
    for (let i = 0; i < shapes; i++) {
      // Calculate position based on time and index
      const angle = (i / shapes) * Math.PI * 2 + time;
      const radius = 150 + Math.sin(time * 0.5 + i * 0.4) * 50;
      
      // Apply mouse influence to position
      const x = centerX + Math.cos(angle) * radius + (mouseXNorm * 100);
      const y = centerY + Math.sin(angle) * radius + (mouseYNorm * 100);
      
      // Size varies with time
      const size = 70 + Math.sin(time + i) * 30;
      
      // Draw shape
      context.save();
      context.translate(x, y);
      context.rotate(time * 0.2 + i * 0.5);
      
      // Alternate between different shapes
      const shapeType = i % 3;
      
      // Different colors for different shapes
      const colors = ['#e879f9', '#38bdf8', '#22c55e'];
      context.fillStyle = colors[shapeType];
      context.globalAlpha = 0.15;
      
      if (shapeType === 0) {
        // Triangle
        context.beginPath();
        context.moveTo(0, -size/2);
        context.lineTo(size/2, size/2);
        context.lineTo(-size/2, size/2);
        context.closePath();
        context.fill();
      } else if (shapeType === 1) {
        // Square
        context.fillRect(-size/2, -size/2, size, size);
      } else {
        // Circle
        context.beginPath();
        context.arc(0, 0, size/2, 0, Math.PI * 2);
        context.fill();
      }
      
      context.restore();
    }
    
    // Draw connecting lines
    context.strokeStyle = '#f0f9ff';
    context.globalAlpha = 0.05;
    context.lineWidth = 1;
    
    for (let i = 0; i < shapes; i++) {
      const angle1 = (i / shapes) * Math.PI * 2 + time;
      const radius1 = 150 + Math.sin(time * 0.5 + i * 0.4) * 50;
      const x1 = centerX + Math.cos(angle1) * radius1 + (mouseXNorm * 100);
      const y1 = centerY + Math.sin(angle1) * radius1 + (mouseYNorm * 100);
      
      for (let j = i + 1; j < shapes; j++) {
        const angle2 = (j / shapes) * Math.PI * 2 + time;
        const radius2 = 150 + Math.sin(time * 0.5 + j * 0.4) * 50;
        const x2 = centerX + Math.cos(angle2) * radius2 + (mouseXNorm * 100);
        const y2 = centerY + Math.sin(angle2) * radius2 + (mouseYNorm * 100);
        
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        if (distance < 300) {
          context.beginPath();
          context.moveTo(x1, y1);
          context.lineTo(x2, y2);
          context.stroke();
        }
      }
    }

    // Draw neon glow circles at mouse position
    const glowX = mousePosition.x || centerX;
    const glowY = mousePosition.y || centerY;

    // Create radial gradient for glow effect
    const glowGradient = context.createRadialGradient(
      glowX, glowY, 10,
      glowX, glowY, 200
    );
    glowGradient.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
    glowGradient.addColorStop(0.5, 'rgba(232, 121, 249, 0.1)');
    glowGradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

    context.fillStyle = glowGradient;
    context.globalAlpha = 0.6;
    context.beginPath();
    context.arc(glowX, glowY, 200, 0, Math.PI * 2);
    context.fill();

    // Add subtle grid pattern
    drawGrid(context, canvas, time);
  };

  // Draw grid pattern
  const drawGrid = (context, canvas, time) => {
    const gridSize = 50;
    const offsetX = Math.sin(time * 0.2) * 10;
    const offsetY = Math.cos(time * 0.2) * 10;
    
    context.strokeStyle = '#f8fafc';
    context.globalAlpha = 0.03;
    context.lineWidth = 1;
    
    // Vertical lines
    for (let x = offsetX; x < canvas.width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }
    
    // Horizontal lines
    for (let y = offsetY; y < canvas.height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Overlay with noise texture for added depth */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px'
        }}
      />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-30" />
    </div>
  );
};

export default PortfolioBackgroundAlt;