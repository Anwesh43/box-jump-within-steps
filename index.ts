const w : number = window.innerWidth
const h : number = window.innerHeight 
const parts : number = 4
const scGap : number = 0.02 / parts 
const steps : number = 1 + parts   
const strokeFactor : number = 20 
const boxSizeFactror : number = 5 
const colors : Array<string> = [
    "#f44336",
    "#673AB7",
    "#BF360C",
    "#006064",
    "#FFD600"
]
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
        const scDiv : number = 1 / parts 
        const currJ = Math.floor(sf / scDiv)
        var x = 0, y = gap / 2, rot = 90 * ScaleUtil.divideScale(sf, currJ, parts)
        for (var j = 0; j < steps; j++) {
            x += (gap) * j 
            y += gap 
            DrawingUtil.drawLine(context, 0, y, x, y)
        }
        context.save()
        context.translate(x, y)
        context.fillRect(-gap, 0, gap, gap)
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

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}