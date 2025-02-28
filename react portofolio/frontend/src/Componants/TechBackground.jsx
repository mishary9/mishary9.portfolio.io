import React, { useEffect, useRef, useState } from 'react';

const TechBackground = () => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const nodesRef = useRef([]);
  const requestRef = useRef();
  const colorScheme = {
    background: '#0f0f0f',
    primary: '#10b981',
    secondary: '#06b6d4',
    accent: '#8b5cf6',
    lines: 'rgba(255, 255, 255, 0.1)'
  };

  // Initialize dimensions and handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        initializeNodes(width, height);
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize nodes
  const initializeNodes = (width, height) => {
    const nodeCount = Math.floor(width * height / 15000); // Adjust density
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: [colorScheme.primary, colorScheme.secondary, colorScheme.accent][Math.floor(Math.random() * 3)]
      });
    }

    nodesRef.current = nodes;
  };

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { left, top } = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - left,
        y: e.clientY - top
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const canvas = document.getElementById('tech-canvas');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const { width, height } = dimensions;
      
      // Clear canvas
      ctx.fillStyle = colorScheme.background;
      ctx.fillRect(0, 0, width, height);
      
      // Draw hexagon pattern
      drawHexagonPattern(ctx, width, height);
      
      // Update and draw nodes
      const nodes = nodesRef.current;
      
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Move nodes
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off edges
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        
        // Mouse interaction - attract nodes
        const dx = mousePosition.x - node.x;
        const dy = mousePosition.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxForce = 150;
        
        if (distance < maxForce) {
          const force = (maxForce - distance) / maxForce;
          node.vx += (dx / distance) * force * 0.02;
          node.vy += (dy / distance) * force * 0.02;
        }
        
        // Limit velocity
        const maxVel = 1.5;
        const vel = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (vel > maxVel) {
          node.vx = (node.vx / vel) * maxVel;
          node.vy = (node.vy / vel) * maxVel;
        }
        
        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      }
      
      // Draw connections
      ctx.strokeStyle = colorScheme.lines;
      ctx.lineWidth = 0.4;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.globalAlpha = (100 - distance) / 100;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      
      ctx.globalAlpha = 1;
      
      // Draw digital circuits
      drawCircuits(ctx, width, height);
      
      // Add glow to mouse pointer
      drawMouseGlow(ctx);
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [dimensions, mousePosition]);
  
  // Draw hexagon pattern
  const drawHexagonPattern = (ctx, width, height) => {
    const hexSize = 40;
    const hexHeight = hexSize * Math.sqrt(3);
    const cols = Math.ceil(width / (hexSize * 1.5)) + 1;
    const rows = Math.ceil(height / hexHeight) + 1;
    
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)'; // Light primary color
    ctx.lineWidth = 1;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * hexSize * 1.5;
        const y = row * hexHeight + (col % 2 === 0 ? 0 : hexHeight / 2);
        
        drawHexagon(ctx, x, y, hexSize);
      }
    }
  };
  
  // Draw a single hexagon
  const drawHexagon = (ctx, x, y, size) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = x + size * Math.cos(angle);
      const hy = y + size * Math.sin(angle);
      
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
  };
  
  // Draw digital circuits
  const drawCircuits = (ctx, width, height) => {
    const time = performance.now() * 0.001;
    const circuitCount = 5;
    
    ctx.strokeStyle = colorScheme.secondary;
    ctx.lineWidth = 1.5;
    
    for (let i = 0; i < circuitCount; i++) {
      const startX = Math.sin(time * 0.2 + i) * width * 0.4 + width * 0.5;
      const startY = 0;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      let x = startX;
      let y = 0;
      
      // Create a path with right angles
      const segments = 10 + i * 2;
      const maxLength = height / segments;
      
      for (let j = 0; j < segments; j++) {
        const direction = Math.floor(Math.sin(time * 0.5 + i + j) * 2);
        
        if (j % 2 === 0) {
          // Horizontal movement
          const length = (Math.sin(time * 0.3 + i * 0.7 + j) * 0.5 + 0.5) * maxLength;
          x += direction * length;
        } else {
          // Vertical movement
          const length = (Math.sin(time * 0.2 + i * 0.5 + j) * 0.3 + 0.7) * maxLength;
          y += length;
        }
        
        ctx.lineTo(x, y);
        
        // Random "component" on the circuit
        if (j % 3 === 0) {
          const size = 3 + Math.sin(time + i + j) * 2;
          ctx.save();
          ctx.fillStyle = colorScheme.secondary;
          ctx.translate(x, y);
          
          // Different component shapes
          const componentType = (i + j) % 3;
          
          if (componentType === 0) {
            // Square
            ctx.fillRect(-size, -size, size * 2, size * 2);
          } else if (componentType === 1) {
            // Circle
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Diamond
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.lineTo(size, 0);
            ctx.lineTo(0, size);
            ctx.lineTo(-size, 0);
            ctx.closePath();
            ctx.fill();
          }
          
          ctx.restore();
        }
      }
      
      // Add pulse effect
      const pulseSpeed = 0.8;
      const pulsePosition = (time * pulseSpeed) % 1;
      const gradient = ctx.createLinearGradient(startX, 0, x, y);
      
      gradient.addColorStop(Math.max(0, pulsePosition - 0.03), 'rgba(6, 182, 212, 0.2)');
      gradient.addColorStop(pulsePosition, 'rgba(6, 182, 212, 0.8)');
      gradient.addColorStop(Math.min(1, pulsePosition + 0.03), 'rgba(6, 182, 212, 0.2)');
      
      ctx.strokeStyle = gradient;
      ctx.stroke();
    }
  };
  
  // Draw glow around mouse pointer
  const drawMouseGlow = (ctx) => {
    if (mousePosition.x === 0 && mousePosition.y === 0) return;
    
    const gradient = ctx.createRadialGradient(
      mousePosition.x, mousePosition.y, 5,
      mousePosition.x, mousePosition.y, 100
    );
    
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
    gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(mousePosition.x, mousePosition.y, 100, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 w-full h-full -z-10"
      style={{ backgroundColor: colorScheme.background }}
    >
      <canvas 
        id="tech-canvas" 
        width={dimensions.width} 
        height={dimensions.height} 
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Tech-inspired overlay with code symbols */}
      <div 
        className="absolute inset-0 mix-blend-soft-light opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ctext x='10' y='30' font-family='monospace' font-size='20'%3E%7B%7D%3C/text%3E%3Ctext x='60' y='60' font-family='monospace' font-size='20'%3E%3C/%3E%3C/text%3E%3Ctext x='40' y='90' font-family='monospace' font-size='20'%3E%3E_%3C/text%3E%3Ctext x='90' y='20' font-family='monospace' font-size='20'%3E;=%3C/text%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }}
      />
    </div>
  );
};

export default TechBackground;