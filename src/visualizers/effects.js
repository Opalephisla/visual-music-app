export class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.size = Math.random() * 4 + 1;
        this.speedX = (Math.random() - 0.5) * 6; this.speedY = (Math.random() * -6) - 2;
        this.color = color; this.life = 1; this.gravity = 0.15;
    }
    update(deltaTime) {
        const dt = deltaTime * 0.06; this.x += this.speedX * dt;
        this.y += this.speedY * dt; this.speedY += this.gravity * dt;
        this.life -= 0.02 * dt; if (this.size > 0.1) this.size -= 0.03 * dt;
    }
    draw(ctx) {
        if (this.life <= 0) return; ctx.save();
        ctx.globalAlpha = this.life; ctx.fillStyle = this.color;
        ctx.shadowColor = this.color; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill(); ctx.restore();
    }
}

export class LightBeam {
    constructor(x, width, color) {
        this.x = x - width / 2; this.width = width; this.height = 0;
        this.color = color; this.life = 1;
    }
    update(canvas) { 
      this.maxHeight = canvas.height / window.devicePixelRatio * 0.6;
      this.life -= 0.012; 
      this.height += (this.maxHeight - this.height) * 0.08; 
    }
    draw(ctx, pianoHeight) {
        if (this.life <= 0) return;
        const y = ctx.canvas.height / window.devicePixelRatio - pianoHeight;
        const grad = ctx.createLinearGradient(this.x, y, this.x, y - this.height);
        grad.addColorStop(0, `rgba(${this.color}, 0.4)`);
        grad.addColorStop(1, `rgba(${this.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.globalAlpha = this.life;
        ctx.fillRect(this.x, y - this.height, this.width, this.height);
        ctx.globalAlpha = 1.0;
    }
}

export class Star {
    constructor() { this.x = Math.random(); this.y = Math.random(); this.z = Math.random() * 0.8 + 0.2; this.size = this.z * 2; }
    update(canvas) { this.y += (this.z * 1.2) / (canvas.height / window.devicePixelRatio); if (this.y > 1) { this.y = 0; this.x = Math.random(); } }
    draw(ctx) {
        const clientWidth = ctx.canvas.width / window.devicePixelRatio;
        const clientHeight = ctx.canvas.height / window.devicePixelRatio;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.z * 0.7})`; 
        ctx.beginPath(); 
        ctx.arc(this.x * clientWidth, this.y * clientHeight, this.size / 2, 0, Math.PI * 2); 
        ctx.fill(); 
    }
}