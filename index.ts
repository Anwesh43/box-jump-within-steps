const w : number = window.innerWidth
const h : number = window.innerHeight 
const parts : number = 5 
const scGap : number = 0.02 / 5 
const steps : number = 4 
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