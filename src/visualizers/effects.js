export class Particle {
    constructor(x, y, color, visualType = 'flowing') {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.color = color;
        this.visualType = visualType;
        this.life = 1;
        this.time = 0;
        
        // Different particle behaviors based on instrument type
        switch(visualType) {
            case 'electric':
                this.size = Math.random() * 3 + 2;
                this.speedX = (Math.random() - 0.5) * 8;
                this.speedY = (Math.random() * -8) - 3;
                this.gravity = 0.2;
                this.sparkle = true;
                this.fadeRate = 0.025;
                break;
                
            case 'atmospheric':
                this.size = Math.random() * 6 + 3;
                this.speedX = (Math.random() - 0.5) * 2;
                this.speedY = (Math.random() * -3) - 1;
                this.gravity = 0.05;
                this.fadeRate = 0.008;
                this.oscillationSpeed = 0.5;
                break;
                
            case 'bass':
                this.size = Math.random() * 8 + 5;
                this.speedX = (Math.random() - 0.5) * 3;
                this.speedY = (Math.random() * -4) - 1;
                this.gravity = 0.3;
                this.pulseRate = 0.1;
                this.fadeRate = 0.015;
                break;
                
            case 'crystalline':
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 4;
                this.speedY = (Math.random() * -6) - 2;
                this.gravity = 0.08;
                this.rotation = 0;
                this.rotationSpeed = (Math.random() - 0.5) * 0.2;
                this.facets = Math.floor(Math.random() * 3) + 4;
                this.fadeRate = 0.018;
                break;
                
            case 'wind':
                this.size = Math.random() * 3 + 1.5;
                this.speedX = (Math.random() - 0.5) * 12;
                this.speedY = (Math.random() * -5) - 2;
                this.gravity = -0.1; // Float upward
                this.oscillation = Math.random() * Math.PI * 2;
                this.oscillationSpeed = 0.15;
                this.fadeRate = 0.022;
                break;
                
            case 'brass':
                this.size = Math.random() * 4 + 2;
                this.speedX = (Math.random() - 0.5) * 6;
                this.speedY = (Math.random() * -7) - 3;
                this.gravity = 0.15;
                this.brightness = Math.random() * 0.3 + 0.7;
                this.fadeRate = 0.02;
                break;
                
            case 'strings':
                this.size = Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 5;
                this.speedY = (Math.random() * -6) - 2;
                this.gravity = 0.12;
                this.vibration = 0;
                this.vibrationSpeed = 0.3 + Math.random() * 0.2;
                this.fadeRate = 0.02;
                break;
                
            case 'plucked':
                this.size = Math.random() * 4 + 2;
                this.speedX = (Math.random() - 0.5) * 10;
                this.speedY = (Math.random() * -8) - 2;
                this.gravity = 0.25;
                this.decay = 0.98;
                this.fadeRate = 0.03;
                break;
                
            case 'bell':
                this.size = Math.random() * 5 + 3;
                this.speedX = (Math.random() - 0.5) * 4;
                this.speedY = (Math.random() * -5) - 2;
                this.gravity = 0.1;
                this.rippleRadius = 0;
                this.rippleSpeed = 2;
                this.fadeRate = 0.015;
                break;
                
            case 'monumental':
                this.size = Math.random() * 10 + 6;
                this.speedX = (Math.random() - 0.5) * 2;
                this.speedY = (Math.random() * -2) - 0.5;
                this.gravity = 0.03;
                this.fadeRate = 0.005;
                break;
                
            case 'ethereal':
                this.size = Math.random() * 4 + 2;
                this.speedX = (Math.random() - 0.5) * 3;
                this.speedY = (Math.random() * -3) - 1;
                this.gravity = -0.05; // Float gently upward
                this.shimmer = 0;
                this.shimmerSpeed = 0.1;
                this.fadeRate = 0.012;
                break;
                
            case 'geometric':
                this.size = Math.random() * 3 + 2;
                this.speedX = (Math.random() - 0.5) * 4;
                this.speedY = (Math.random() * -5) - 2;
                this.gravity = 0.12;
                this.sides = Math.floor(Math.random() * 4) + 3; // 3-6 sides
                this.rotation = 0;
                this.rotationSpeed = (Math.random() - 0.5) * 0.15;
                this.fadeRate = 0.02;
                break;
                
            default: // 'flowing' and others
                this.size = Math.random() * 4 + 1;
                this.speedX = (Math.random() - 0.5) * 6;
                this.speedY = (Math.random() * -6) - 2;
                this.gravity = 0.15;
                this.fadeRate = 0.02;
                break;
        }
    }
    
    update(deltaTime) {
        const dt = deltaTime * 0.06;
        this.time += dt;
        
        // Base movement
        this.x += this.speedX * dt;
        this.y += this.speedY * dt;
        this.speedY += this.gravity * dt;
        
        // Type-specific behaviors
        switch(this.visualType) {
            case 'electric':
                if (this.sparkle && Math.random() < 0.1) {
                    this.size *= 1.5;
                    this.sparkle = false;
                }
                this.life -= this.fadeRate * dt;
                break;
                
            case 'atmospheric':
                this.x += Math.sin(this.time * this.oscillationSpeed) * 0.5;
                this.life -= this.fadeRate * dt;
                break;
                
            case 'bass':
                this.size += Math.sin(this.time * this.pulseRate) * 0.5;
                this.life -= this.fadeRate * dt;
                break;
                
            case 'crystalline':
                this.rotation += this.rotationSpeed * dt;
                this.life -= this.fadeRate * dt;
                break;
                
            case 'wind':
                this.oscillation += this.oscillationSpeed * dt;
                this.x += Math.sin(this.oscillation) * 2;
                this.life -= this.fadeRate * dt;
                break;
                
            case 'brass':
                this.brightness = Math.max(0.5, this.brightness - 0.01 * dt);
                this.life -= this.fadeRate * dt;
                break;
                
            case 'strings':
                this.vibration += this.vibrationSpeed * dt;
                this.x += Math.sin(this.vibration) * 0.8;
                this.life -= this.fadeRate * dt;
                break;
                
            case 'plucked':
                this.speedX *= this.decay;
                this.speedY *= this.decay;
                this.life -= this.fadeRate * dt;
                break;
                
            case 'bell':
                this.rippleRadius += this.rippleSpeed * dt;
                this.life -= this.fadeRate * dt;
                break;
                
            case 'monumental':
                this.life -= this.fadeRate * dt;
                break;
                
            case 'ethereal':
                this.shimmer += this.shimmerSpeed * dt;
                this.x += Math.sin(this.shimmer) * 0.3;
                this.life -= this.fadeRate * dt;
                break;
                
            case 'geometric':
                this.rotation += this.rotationSpeed * dt;
                this.life -= this.fadeRate * dt;
                break;
                
            default:
                this.life -= this.fadeRate * dt;
                break;
        }
        
        // Reduce size over time
        if (this.size > 0.1) {
            this.size -= 0.03 * dt;
        }
    }
    
    draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.life;
        
        switch(this.visualType) {
            case 'electric':
                this.drawElectric(ctx);
                break;
            case 'crystalline':
                this.drawCrystalline(ctx);
                break;
            case 'wind':
                this.drawWind(ctx);
                break;
            case 'brass':
                this.drawBrass(ctx);
                break;
            case 'bell':
                this.drawBell(ctx);
                break;
            case 'monumental':
                this.drawMonumental(ctx);
                break;
            case 'ethereal':
                this.drawEthereal(ctx);
                break;
            case 'geometric':
                this.drawGeometric(ctx);
                break;
            default:
                this.drawDefault(ctx);
                break;
        }
        
        ctx.restore();
    }
    
    drawElectric(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Draw jagged electric particle
        ctx.beginPath();
        const points = 6;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = this.size + (Math.random() - 0.5) * this.size * 0.5;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    drawCrystalline(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw crystal facets
        ctx.beginPath();
        for (let i = 0; i < this.facets; i++) {
            const angle = (i / this.facets) * Math.PI * 2;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    drawWind(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        
        // Draw flowing wind particle
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size * 2, this.size, this.oscillation, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawBrass(ctx) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0.3)'); // Gold tint
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12 * this.brightness;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawBell(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        
        // Draw center particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw ripple effect
        if (this.rippleRadius > 0) {
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = this.life * 0.3;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.rippleRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawMonumental(ctx) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(139, 69, 19, 0.3)'); // Brown cathedral tint
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawEthereal(ctx) {
        const shimmerAlpha = (Math.sin(this.shimmer) + 1) * 0.3 + 0.4;
        ctx.globalAlpha = this.life * shimmerAlpha;
        
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add shimmer ring
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = this.life * 0.2;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    drawGeometric(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw geometric shape
        ctx.beginPath();
        for (let i = 0; i < this.sides; i++) {
            const angle = (i / this.sides) * Math.PI * 2;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    drawDefault(ctx) {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}