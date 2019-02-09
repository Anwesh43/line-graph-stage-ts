const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.05
const scDiv : number = 0.51
const sizeFactor : number = 4
const strokeFactor : number = 60
const lineColor : string = "#4CAF50"
const backColor : string = "#212121"
const data : Array<number> = [10, 20, 30, 5, 15, 60, 35, 25]
const dataSorted = [...data].sort()
const yPointMax = dataSorted.pop()
const rFactor : number = 5

const maxScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.max(0, scale - i / n)
}

const divideScale : Function = (scale : number, i : number, n : number) : number => {
    return Math.min(1 / n, maxScale(scale, i, n)) * n
}

const scaleFactor : Function = (scale : number) : number => {
    return Math.floor(scale / scDiv)
}

const mirrorValue : Function = (scale : number, a : number, b : number) : number => {
    const k = scaleFactor(scale)
    return (1 - k) / a + k / b
}

const updateValue : Function = (scale : number, dir : number, a : number, b : number) : number => {
    return mirrorValue(scale, a, b) * dir * scGap
}

const yCoord : Function = (yPoint : number, hSize : number, yPointMax : number) : number => {
    return (yPoint * hSize) / yPointMax
}

const drawVerticalLine : Function = (context : CanvasRenderingContext2D, h : number) => {
      if (h !== 0) {
          context.beginPath()
          context.moveTo(0, 0)
          context.lineTo(0, -h)
          context.stroke()
      }
}

const drawCircle : Function = (context : CanvasRenderingContext2D, r : number) => {
    if (r !== 0) {
        context.beginPath()
        context.arc(0, 0, r, 0, 2 * Math.PI)
        context.fill()
    }
}

const drawLGNode : Function = (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const yPoint : number = data[i]
    const hSize : number = h / 2
    const hGraph : number = yCoord(yPoint, hSize, yPointMax)
    const size : number = w / 2
    const gap : number = (w / 2)  / (data.length + 1)
    const y : number = 2 * h / 3
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    const midx : number = w / 2
    const x : number = midx - size / 2
    const r : number = gap / sizeFactor
    context.save()
    context.translate(x, y)
    drawVerticalLine(context, hGraph * sc1)
    context.save()
    context.translate(0, -hGraph)
    drawCircle(context, r * sc2)
    context.restore()
    context.restore()
}
