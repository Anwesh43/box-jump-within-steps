const w : number = window.innerWidth
const h : number = window.innerHeight 
const parts : number = 4
const scGap : number = 0.02 / parts 
const steps : number = 1 + parts   
const strokeFactor : number = 90 
const boxSizeFactror : number = 5 
const colors : Array<string> = [
    "#f44336",
    "#673AB7",
    "#BF360C",
    "#006064",
    "#FFD600"
]
const delay : number = 20
const backColor : string = "#BDBDBD"
const rot : number = Math.PI / 2

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }
    
    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawBoxJumpWithinStep(context : CanvasRenderingContext2D, scale : number) {
        const gap : number = h / (steps + 1)
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, 2)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, 2)
        const scDiv : number = 1 / steps 
        const currJ = Math.floor(sf2 / scDiv)
        const sfj = ScaleUtil.divideScale(sf2, currJ, steps)
        var x = 0, y = gap, deg = rot * ScaleUtil.divideScale(sfj, 0, 2)
        for (var j = 0; j < steps; j++) {
            const sfj : number = ScaleUtil.divideScale(sf2, j, steps)
            x += (gap * Math.floor(sfj)) 
            y += (gap * ScaleUtil.divideScale(sfj, 1, 2))  
        }
        for (var j = 0; j < steps; j++) {
            DrawingUtil.drawLine(context, 0, gap + gap * j, gap * (j + 1) * sf1, gap + gap * j)
        }
        context.save()
        context.translate(x + gap, y)
        context.rotate(deg)
        context.fillRect(-gap, -gap * sf1, gap, gap * sf1)
        context.restore()
    }

    static drawBJWSNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.fillStyle = colors[i]
        context.strokeStyle = colors[i]
        DrawingUtil.drawBoxJumpWithinStep(context, scale)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    dir : number = 0 
    prevScale : number = 0 

    update(cb : Function) {
        this.scale += scGap * this.dir 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0 
            this.prevScale = this.scale 
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }
}

class Animator {

    animated : boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}

class BJWSNode {

    next : BJWSNode 
    prev : BJWSNode 
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new BJWSNode(this.i + 1)
            this.next.prev = this 
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawBJWSNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }
    
    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : BJWSNode {
        var curr : BJWSNode = this.prev 
        if (dir == 1) {
            curr = this.next 
        }
        if (curr) {
            return curr 
        }
        cb()
        return this 
     }
}

class BoxJumpWithinStep {

    curr : BJWSNode = new BJWSNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    curr : BoxJumpWithinStep = new BoxJumpWithinStep()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    handleTap(cb : Function) {
        this.curr.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.curr.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}