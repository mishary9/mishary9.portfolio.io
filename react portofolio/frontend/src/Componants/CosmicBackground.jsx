import React, { useEffect, useRef, useState } from 'react';

const DarkSpaceBackground = () => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const starsRef = useRef([]);
  const requestAnimationRef = useRef(null);
  const timeRef = useRef(0);

  // Initialize dimensions and handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const { width, height } = canvasRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        setDimensions({ width, height });
        initializeStars(width, height);
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Initialize stars
  const initializeStars = (width, height) => {
    // Create stars - less density for a cleaner look
    const stars = [];
    const starCount = Math.floor(width * height / 1500);
    
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() < 0.8 ? Math.random() * 0.8 + 0.2 : Math.random() * 1.5 + 0.8, // Some stars slightly larger
        brightness: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.01 + 0.003,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
    starsRef.current = stars;
  };

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (canvasRef.current) {
        const { left, top } = canvasRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - left,
          y: e.clientY - top
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current) return;

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const { width, height } = dimensions;
      timeRef.current += 0.005;
      const time = timeRef.current;
      
      // Pure black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      
      // Draw stars
      drawStars(ctx, time);
      
      // Draw mouse interaction
      drawMouseEffect(ctx);
      
      requestAnimationRef.current = requestAnimationFrame(animate);
    };
    
    requestAnimationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestAnimationRef.current);
  }, [dimensions, mousePosition]);

  // Draw twinkling stars
  const drawStars = (ctx, time) => {
    const stars = starsRef.current;
    
    stars.forEach(star => {
      // Twinkle effect - more subtle
      const twinkle = 0.85 + Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.15;
      const brightness = star.brightness * twinkle;
      
      // Draw star
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow only to larger stars
      if (star.radius > 1) {
        const glow = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.radius * 5
        );
        glow.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.4})`);
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  };

  // Draw mouse interaction effect - simple circle
  const drawMouseEffect = (ctx) => {
    if (mousePosition.x === 0 && mousePosition.y === 0) return;
    
    // Simple circular outline that follows mouse
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    
    // Make the orbit circle expand and contract
    const pulseSize = 30 + Math.sin(timeRef.current * 2) * 10;
    
    ctx.beginPath();
    ctx.arc(mousePosition.x, mousePosition.y, pulseSize, 0, Math.PI * 2);
    ctx.stroke();
  };

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-black">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

export default DarkSpaceBackground;