const w : number = window.innerWidth
const h : number = window.innerHeight
const scGap : number = 0.05
const scDiv : number = 0.51
const sizeFactor : number = 4
const strokeFactor : number = 60
const lineColor : string = "#4CAF50"
const backColor : string = "#212121"
const data : Array<number> = [10, 20, 30, 5, 15, 60, 35, 25]
const rFactor : number = 5

class DimensionUtil {
    x : number
    yPointMax : number
    gap : number
    y : number
    r : number
    hSize : number

    constructor() {
        this.initDimensions()
    }

    initDimensions() {
        const size = w / 2
        const midX = w / 2

        const dataSorted = [...data].sort()
        this.yPointMax = dataSorted.pop()
        this.y = 2 * h / 3
        const gap = size / (data.length + 1)
        this.hSize = h / 2
        this.x = midX - size / 2
        this.r = gap / sizeFactor
    }

    getDimensions() : Object {
        return {y : this.y, hSize : this.hSize, yPointMax : this.yPointMax}
    }

    getX(i : number) : number {
        return this.gap * i + this.x
    }

    getHGraph(i : number) : number {
        return (data[i] * this.hSize) / this.yPointMax
    }

    getY() : number {
        return this.y
    }

    getRadius() : number {
        return this.r
    }
}

const dimensionUtil = new DimensionUtil()

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
    const sc1 : number = divideScale(scale, 0, 2)
    const sc2 : number = divideScale(scale, 1, 2)
    const h : number = dimensionUtil.getHGraph(i)
    context.save()
    context.translate(dimensionUtil.getX(i), dimensionUtil.getY())
    drawVerticalLine(context, h * sc1)
    context.save()
    context.translate(0, -h)
    drawCircle(context, dimensionUtil.getRadius() * sc2)
    context.restore()
    context.restore()
}

class JoinPoint {
    constructor(public x : number, public y : number) {

    }

    updateToPoint(jp : JoinPoint, sc : number) : JoinPoint {
        return this.subPoint(jp).mulPoint(sc).addPoint(this)
    }

    mulPoint(a : number) : JoinPoint {
        return new JoinPoint(this.x * a, this.y * a)
    }

    addPoint(jp : JoinPoint) : JoinPoint {
        return new JoinPoint(this.x + jp.x, this.y + jp.y)
    }

    subPoint(jp : JoinPoint) : JoinPoint {
        return new JoinPoint(jp.x - this.x, jp.y - this.y)
    }

    drawPoint(context : CanvasRenderingContext2D, jp : JoinPoint, sc : number) {
        const updatePoint = this.updateToPoint(jp, sc)
        context.beginPath()
        context.moveTo(this.x, this.y)
        context.lineTo(updatePoint.x, updatePoint.y)
        context.stroke()
    }

    static createFromI(i : number) : JoinPoint {
        return new JoinPoint(dimensionUtil.getX(i), dimensionUtil.getY() - dimensionUtil.getHGraph(i))
    }
}
const drawJoinNode : Function = (context : CanvasRenderingContext2D, i : number, scale : number) => {
    const jp1 : JoinPoint = JoinPoint.createFromI(i - 1)
    const jp2 : JoinPoint = JoinPoint.createFromI(i)
    jp1.drawPoint(context, jp2, scale)
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0
    next : State
    prev : State

    addNext() {
        this.next = new State()
        this.next.prev = this
    }

    update(nextcb : Function, cb : Function) {
        this.scale += updateValue(this.scale, this.dir, 1, 1)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            if (this.prevScale == 1 && this.next) {
                this.next.startUpdating(() => {
                    nextcb(this.next)
                })

            } if (this.prevScale == -1 && this.prev) {
                this.prev.startUpdating(() => {
                    nextcb(this.prev)
                })

            } else {
                cb()
            }
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
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class LineGraphStage {
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
        const stage : LineGraphStage = new LineGraphStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class LGNode {
    prev : LGNode
    next : LGNode
    state : State = new State()
    curr : State = this.state
    constructor(private i : number) {
        this.state.addNext()
        this.addNeighbor()

    }

    addNeighbor() {
        if (this.i < data.length - 1) {
            this.next = new LGNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        drawLGNode(context, this.i, this.state.scale)
        if (this.prev) {
            drawJoinNode(context, this.i, this.state.scale)
        }
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.curr.update((state) => {
            this.curr = state
        },cb)
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : LGNode {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr != null) {
            return curr
        }
        cb()
        return this
    }
}

class LineGraph {
    root : LGNode = new LGNode(0)
    curr : LGNode = this.root
    dir : number = 1

    drawLGNode(context : CanvasRenderingContext2D) {
        this.root.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb) {
        this.curr.startUpdating(cb)
    }
}
