import React, { useEffect, useRef, useState } from 'react';

const DarkSpaceBackground = () => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
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

  // Initialize stars with different layers for parallax and movement patterns
  const initializeStars = (width, height) => {
    const stars = [];
    const starCount = Math.floor(width * height / 900); // Even more stars for better effect
    
    // Create star clusters and patterns
    const clusterCenters = [
      { x: width * 0.3, y: height * 0.2, radius: Math.min(width, height) * 0.3 },
      { x: width * 0.7, y: height * 0.8, radius: Math.min(width, height) * 0.25 },
      { x: width * 0.8, y: height * 0.3, radius: Math.min(width, height) * 0.2 }
    ];

    for (let i = 0; i < starCount; i++) {
      // Determine if this star belongs to a cluster (30% chance)
      const inCluster = Math.random() < 0.3;
      let x, y;
      
      if (inCluster) {
        // Position star within a random cluster with some randomness
        const cluster = clusterCenters[Math.floor(Math.random() * clusterCenters.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * cluster.radius;
        x = cluster.x + Math.cos(angle) * distance;
        y = cluster.y + Math.sin(angle) * distance;
      } else {
        // Random position across the canvas
        x = Math.random() * width;
        y = Math.random() * height;
      }
      
      // Add movement patterns
      const movementPatterns = ['linear', 'circular', 'wave', 'static'];
      const pattern = movementPatterns[Math.floor(Math.random() * movementPatterns.length)];
      
      // Generate a few shooting stars (rare)
      const isShooting = Math.random() < 0.01;
      
      stars.push({
        x,
        y,
        radius: Math.random() < 0.8 ? Math.random() * 0.8 + 0.2 : Math.random() * 1.5 + 0.8,
        brightness: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.01 + 0.003,
        twinkleOffset: Math.random() * Math.PI * 2,
        parallaxSpeed: Math.random() * 0.2 + 0.1,
        layer: Math.floor(Math.random() * 3),
        
        // Movement pattern properties
        movementPattern: pattern,
        movementSpeed: Math.random() * 0.4 + 0.1,
        movementRadius: Math.random() * 5 + 2,
        movementOffset: Math.random() * Math.PI * 2,
        
        // For circular movement
        centerX: x,
        centerY: y,
        
        // For shooting stars
        isShooting,
        shootingSpeed: isShooting ? Math.random() * 5 + 5 : 0,
        shootingAngle: Math.random() * Math.PI * 2,
        shootingLength: isShooting ? Math.random() * 20 + 10 : 0,
        shootingProgress: 0,
        
        // For clustering behavior
        inCluster,
        
        // Last position for trails and animation
        lastX: x,
        lastY: y,
        lastScrollY: 0
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

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

      // Smoother gradient background with lighter colors
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#0a0a12'); // Slightly lighter and bluer dark
      gradient.addColorStop(1, '#050508'); // Slightly lighter than pure black
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Create subtle nebula effect
      drawNebulaEffect(ctx, time);

      // Draw stars with scroll effect
      drawStars(ctx, time);

      // Draw mouse interaction
      drawMouseEffect(ctx);

      requestAnimationRef.current = requestAnimationFrame(animate);
    };

    requestAnimationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestAnimationRef.current);
  }, [dimensions, mousePosition, scrollPosition]);

  // Draw subtle nebula clouds in background
  const drawNebulaEffect = (ctx, time) => {
    const { width, height } = dimensions;
    
    // Create a few random nebula clouds
    for (let i = 0; i < 3; i++) {
      const x = width * (0.2 + i * 0.3);
      const y = height * (0.3 + Math.sin(time * 0.1 + i) * 0.1);
      const radius = Math.min(width, height) * (0.2 + Math.sin(time * 0.05 + i) * 0.05);
      
      const colors = [
        [48, 25, 52, 0.03],  // Purple hue
        [25, 38, 52, 0.02],  // Blue hue
        [52, 25, 36, 0.02]   // Red hue
      ];
      
      const [r, g, b, a] = colors[i % colors.length];
      
      const glow = ctx.createRadialGradient(
        x, y, 0,
        x, y, radius
      );
      glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Draw twinkling stars with parallax effect, scroll response, and dynamic movement patterns
  const drawStars = (ctx, time) => {
    const stars = starsRef.current;
    const { width, height } = dimensions;
    
    // Calculate scroll effect values
    const scrollOffset = scrollPosition * 0.5;
    // Calculate scroll speed for dynamic effects
    const scrollSpeed = Math.abs(scrollPosition - (stars[0]?.lastScrollY || 0));
    
    // Create a vortex effect when scrolling fast
    const vortexActive = scrollSpeed > 15;
    const vortexX = width / 2;
    const vortexY = height / 2;
    const vortexStrength = Math.min(0.3, scrollSpeed * 0.01);
    
    stars.forEach(star => {
      // Store initial position for animation calculations
      const initialX = star.x;
      const initialY = star.y;
      
      // Apply unique movement pattern for each star
      let movementX = 0;
      let movementY = 0;
      
      // Handle shooting stars
      if (star.isShooting) {
        // Update shooting progress
        star.shootingProgress += star.shootingSpeed * 0.01;
        
        // Reset shooting star when animation completes
        if (star.shootingProgress > 1) {
          star.shootingProgress = 0;
          star.shootingAngle = Math.random() * Math.PI * 2;
          star.x = Math.random() * width;
          star.y = Math.random() * height;
          star.lastX = star.x;
          star.lastY = star.y;
        } else {
          // Move shooting star along its path
          movementX += Math.cos(star.shootingAngle) * star.shootingSpeed;
          movementY += Math.sin(star.shootingAngle) * star.shootingSpeed;
        }
      } 
      // Apply pattern movement
      else {
        switch (star.movementPattern) {
          case 'circular':
            // Circular movement around a center point
            movementX = Math.cos(time * star.movementSpeed + star.movementOffset) * star.movementRadius;
            movementY = Math.sin(time * star.movementSpeed + star.movementOffset) * star.movementRadius;
            break;
            
          case 'wave':
            // Wave movement pattern
            movementX = Math.sin(time * star.movementSpeed + star.movementOffset) * star.movementRadius;
            movementY = Math.cos(time * star.movementSpeed * 0.5 + star.movementOffset) * star.movementRadius;
            break;
            
          case 'linear':
            // Linear drift in a specific direction
            movementX = Math.cos(star.movementOffset) * time * star.movementSpeed * 0.1 % (width * 0.2);
            movementY = Math.sin(star.movementOffset) * time * star.movementSpeed * 0.1 % (height * 0.2);
            break;
            
          default: // 'static'
            // No additional movement
            break;
        }
      }
      
      // Apply base position + movement pattern
      let posX = initialX + movementX;
      let posY = initialY + movementY;
      
      // Apply both mouse parallax and scroll parallax
      let parallaxX = posX + (mousePosition.x - width / 2) * star.parallaxSpeed;
      let parallaxY = posY + (mousePosition.y - height / 2) * star.parallaxSpeed;
      
      // Apply different scroll speeds based on star layer
      if (star.layer === 0) {
        // Fast layer
        parallaxY += scrollOffset * 0.5;
        // Add horizontal sway based on scroll direction
        parallaxX += Math.sin(time + scrollPosition * 0.002) * 3;
      } else if (star.layer === 1) {
        // Medium layer
        parallaxY += scrollOffset * 0.25;
        parallaxX += Math.sin(time * 0.5 + scrollPosition * 0.001) * 2;
      } else {
        // Slow layer
        parallaxY += scrollOffset * 0.12;
        parallaxX += Math.sin(time * 0.25 + scrollPosition * 0.0005) * 1;
      }
      
      // Apply vortex effect during fast scrolling
      if (vortexActive) {
        const dx = parallaxX - vortexX;
        const dy = parallaxY - vortexY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Stars get pulled toward center when scrolling fast
        const pullFactor = 1 - Math.min(1, distance / (Math.min(width, height) * 0.8));
        const vortexEffect = vortexStrength * pullFactor * (star.layer === 0 ? 2 : star.layer === 1 ? 1 : 0.5);
        
        // Add spiral motion
        const spiralAngle = angle + vortexEffect * Math.PI * 2;
        const newDistance = distance * (1 - vortexEffect * 0.1);
        
        parallaxX = vortexX + Math.cos(spiralAngle) * newDistance;
        parallaxY = vortexY + Math.sin(spiralAngle) * newDistance;
      }
      
      // Add a responsive wave effect based on scroll
      const scrollWaveFactor = Math.max(0.1, Math.min(1, Math.abs(scrollSpeed) / 50));
      const waveX = Math.sin(time + star.twinkleOffset + scrollPosition * 0.001) * 3 * star.layer * scrollWaveFactor;
      const waveY = Math.cos(time * 0.7 + star.twinkleOffset + scrollPosition * 0.002) * 2 * star.layer * scrollWaveFactor;
      parallaxX += waveX;
      parallaxY += waveY;
      
      // Wrap stars when they go off screen
      parallaxX = (parallaxX + width * 1.2) % (width * 1.2) - width * 0.1;
      parallaxY = (parallaxY + height * 1.2) % (height * 1.2) - height * 0.1;
      
      // Enhanced twinkling with scroll influence
      const scrollInfluence = Math.sin(scrollPosition * 0.01 + star.twinkleOffset) * 0.1;
      const twinkle = 0.85 + (Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.15) + scrollInfluence;
      const brightness = star.brightness * twinkle;

      // Draw the star with enhanced brightness for scrolling
      const speedFactor = Math.min(1, scrollSpeed / 30);
      const scrollBrightness = Math.min(1, brightness + (speedFactor * 0.2));
      
      // Color variations for stars based on layer and movement pattern
      let starColor = [255, 255, 255]; // Default white
      
      if (star.movementPattern === 'circular' && star.layer === 0) {
        // Slight blue tint for fast circular stars
        starColor = [220, 235, 255];
      } else if (star.isShooting) {
        // Yellow-white for shooting stars
        starColor = [255, 250, 220];
      } else if (star.inCluster && star.layer === 2) {
        // Slight golden tint for clustered stars in slow layer
        starColor = [255, 240, 220];
      }
      
      // Apply color and draw star
      ctx.fillStyle = `rgba(${starColor[0]}, ${starColor[1]}, ${starColor[2]}, ${scrollBrightness})`;
      
      // Draw shooting star trail
      if (star.isShooting && star.shootingProgress > 0) {
        // Shooting star trail
        ctx.beginPath();
        ctx.moveTo(parallaxX, parallaxY);
        const trailLength = star.shootingLength * star.shootingProgress;
        const trailEndX = parallaxX - Math.cos(star.shootingAngle) * trailLength;
        const trailEndY = parallaxY - Math.sin(star.shootingAngle) * trailLength;
        
        const gradient = ctx.createLinearGradient(
          parallaxX, parallaxY,
          trailEndX, trailEndY
        );
        gradient.addColorStop(0, `rgba(${starColor[0]}, ${starColor[1]}, ${starColor[2]}, ${scrollBrightness})`);
        gradient.addColorStop(1, `rgba(${starColor[0]}, ${starColor[1]}, ${starColor[2]}, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.radius * 2;
        ctx.lineTo(trailEndX, trailEndY);
        ctx.stroke();
      }
      
      // Draw normal star
      ctx.beginPath();
      ctx.arc(parallaxX, parallaxY, star.radius, 0, Math.PI * 2);
      ctx.fill();

      // Add glow to larger stars
      if (star.radius > 1) {
        const glow = ctx.createRadialGradient(
          parallaxX, parallaxY, 0,
          parallaxX, parallaxY, star.radius * 5
        );
        glow.addColorStop(0, `rgba(${starColor[0]}, ${starColor[1]}, ${starColor[2]}, ${brightness * 0.4})`);
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(parallaxX, parallaxY, star.radius * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Add motion trails for fast-moving stars during scroll
      if (scrollSpeed > 10 && (star.layer === 0 || star.isShooting)) {
        const trailOpacity = Math.min(0.3, scrollSpeed * 0.005) * brightness;
        
        ctx.strokeStyle = `rgba(${starColor[0]}, ${starColor[1]}, ${starColor[2]}, ${trailOpacity})`;
        ctx.lineWidth = star.radius * 0.7;
        ctx.beginPath();
        ctx.moveTo(parallaxX, parallaxY);
        ctx.lineTo(star.lastX, star.lastY);
        ctx.stroke();
      }
      
      // Store current position for trails
      star.lastX = parallaxX;
      star.lastY = parallaxY;
      
      // Update position
      star.x = posX;
      star.y = posY;
      
      // Store last scroll position for animation
      star.lastScrollY = scrollPosition;
    });
  };

  // Draw mouse interaction ripple effect
  const drawMouseEffect = (ctx) => {
    if (mousePosition.x === 0 && mousePosition.y === 0) return;

    // Enhanced ripple effect
    const pulseSize = 30 + Math.sin(timeRef.current * 2) * 10;
    const scrollInfluence = Math.min(150, scrollPosition * 0.05);
    
    // Main pulse circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(mousePosition.x, mousePosition.y, pulseSize + scrollInfluence * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Multiple ripple circles with scroll influence
    for (let i = 1; i <= 3; i++) {
      const opacity = 0.1 - (i * 0.02) - (scrollPosition * 0.0001);
      if (opacity <= 0) continue;
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 2 / i;
      ctx.beginPath();
      ctx.arc(
        mousePosition.x, 
        mousePosition.y, 
        pulseSize + i * 15 + scrollInfluence * i * 0.2, 
        0, 
        Math.PI * 2
      );
      ctx.stroke();
    }
    
    // Add mouse trail effect when scrolling
    if (Math.abs(scrollPosition) > 10) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < 5; i++) {
        const trailSize = 3 - (i * 0.5);
        ctx.beginPath();
        ctx.arc(
          mousePosition.x + Math.sin(timeRef.current * 10) * i * 2,
          mousePosition.y + i * 5 * (scrollPosition > 0 ? 1 : -1),
          trailSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default DarkSpaceBackground;