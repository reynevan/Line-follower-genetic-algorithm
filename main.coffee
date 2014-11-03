jQuery ($) ->
  canvas = document.getElementById 'can'
  can = {
    w: 800,
    h: 800
  }
  canvas.width = can.w
  canvas.height = can.h

  ctx = canvas.getContext('2d')

  window.infinity = true

  mouse =
    down: false
    x: 0
    y: 0
    
  config = 
    interval: 20

  inPopulation = 10

  window.track = []
  window.pause = false
  window.drawing = false

  #buttons
  $(document).on 'keydown', (event) ->
    if event.keyCode == 80
      window.pause = !window.pause
  $('#population').on 'change', () ->
    population = 1
    generation = 1
    inPopulation = $(this).val()
  $('#infinity').on 'change', () ->
    if $(this).prop('checked')
      window.infinity = true
    else
      window.infinity = false
  $('#btn-pause').on 'click', () ->
    window.pause = !window.pause
  $('#btn-next').on 'click', () ->
    objects[generation][..].pop().stop = true
  $('#btn-place').on 'click', () ->
    window.placing = 1
    window.drawing = false
    $('#btn-draw').text('Draw track')
  $('#btn-start').on 'click', () ->
    window.start = true
  $('#btn-draw').on 'click', () ->
    if !window.drawing
      $(this).text('Ready')
    else
      $(this).text('Draw track')
    window.drawing = !window.drawing

  $('#can').on 'mousedown', (event) ->
    mouse.down = true
    mouse.x = event.pageX
    mouse.y = event.pageY
    if window.drawing
      track.push {x: mouse.x, y: mouse.y}
    if window.placing == 1
      LF.x = mouse.x
      LF.y = mouse.y
      objects[1].push(new LF())
      window.placing = 2
    else if window.placing == 2
      LF.deg = Math.atan2 mouse.y-LF.y, mouse.x-LF.x
      objects[1][0].deg = LF.deg
      window.placing = 0

  $('#can').on 'mouseup', (event) ->
    mouse.down = false
  $('#can').on 'mousemove', (event) ->
    
    if mouse.down and window.drawing
      track.push {x: mouse.x, y: mouse.y}
    if window.placing == 2
      LF.deg = Math.atan2 mouse.y-LF.y, mouse.x-LF.x
      objects[1][0].deg = LF.deg
    mouse.x = event.pageX
    mouse.y = event.pageY

  drawTrack = () ->
    if window.track.length > 1 
      ctx.save()
      ctx.lineWidth = 10
      ctx.lineJoin = "round"
      ctx.lineCap = 'butt'
      ctx.beginPath()
      ctx.moveTo window.track[0].x, window.track[0].y
      for i in [0...window.track.length-1]
        ctx.lineTo window.track[i+1].x, window.track[i+1].y

      ctx.stroke()
      ctx.closePath()
      ctx.restore()  

  rand = (n) ->
    Math.random()*2*n-(n)

  generation = 1
  population = 1
  objects = []
  objects[1] = []

  # # # # # # # # # # # # # LF class
  class LF
    @x: 558
    @y: 752
    @deg: 0
    constructor: (weights) ->
      console.log 'population:'+population+' gen:'+generation
      this.sensors = [0,0,0,0,0,0,0,0,0]
      this.sensors0 = [0,0,0,0,0,0,0,0,0]
      if !weights
        this.weights = [rand(6), rand(6), rand(6), rand(6), rand(6), rand(6), rand(6), rand(6), rand(6)]
      else
        this.weights = weights
        for i in [0...this.weights.length]
          if Math.random() > 0.95
            this.weights[i] = rand(6)
            console.log 'MUTATION :D'
      console.log this.weights
      this.x = LF.x
      this.y = LF.y
      this.x0 = LF.x
      this.y0 = LF.y
      this.deg = LF.deg
      this.speed = 80
      this.penalty = 0
      this.errCount = 0
      this.stop = false
      this.time = 0
      this.len = 20
    draw: ->
      ctx.save()

      ctx.beginPath()
      ctx.fillStyle = '#f50'
      ctx.arc this.x, this.y, 5, 0, 2*Math.PI
      ctx.fillStyle = '#09c'
      ctx.fill()
      ctx.closePath()

      ctx.beginPath()
      ctx.moveTo this.x+20*Math.sin(this.deg)+this.len*Math.cos(this.deg), this.y-20*Math.cos(this.deg)+this.len*Math.sin(this.deg)
      ctx.lineTo this.x-20*Math.sin(this.deg)+this.len*Math.cos(this.deg), this.y+20*Math.cos(this.deg)+this.len*Math.sin(this.deg)
      ctx.moveTo this.x+20*Math.sin(this.deg)+(this.len-1)*Math.cos(this.deg), this.y-20*Math.cos(this.deg)+(this.len-1)*Math.sin(this.deg)
      ctx.lineTo this.x-20*Math.sin(this.deg)+(this.len-1)*Math.cos(this.deg), this.y+20*Math.cos(this.deg)+(this.len-1)*Math.sin(this.deg)
      ctx.stroke()
      ctx.closePath()

      ctx.restore()
    getData: ->
      ctx.save()
      ctx.fillStyle = '#f00'
      center = Math.ceil this.sensors.length/2
      whitePixels = 0
      ctx.fillStyle = '#f00'
      ctx.shadowColor = '#f00'
      ctx.shadowBlur = 3
      for i in [0...this.sensors.length]
        x0 = this.x+20*Math.sin(this.deg)+this.len*Math.cos(this.deg)-Math.sin(this.deg)*i*40/(this.sensors.length-1)
        y0 = this.y-20*Math.cos(this.deg)+this.len*Math.sin(this.deg)+Math.cos(this.deg)*i*40/(this.sensors.length-1)
        x01 = this.x+20*Math.sin(this.deg)+(this.len-1)*Math.cos(this.deg)-Math.sin(this.deg)*i*40/(this.sensors.length-1)
        y01 = this.y-20*Math.cos(this.deg)+(this.len-1)*Math.sin(this.deg)+Math.cos(this.deg)*i*40/(this.sensors.length-1)
        x = x0+(3*Math.cos(this.deg))
        y = y0+(3*Math.sin(this.deg))
        pixel = ctx.getImageData x, y, 1, 1
        if pixel.data[3] > 10 #czarne
          this.sensors[i] = 1
          ctx.fillRect x0,y0,1,1
          ctx.fillRect x01,y01,1,1
          if i == center
            this.penalty += 2
        else #biołe
          this.sensors[i] = 0
          whitePixels++
      if whitePixels == this.sensors.length
        this.errCount++
      if this.errCount > 15
        this.stop = true
        this.penalty += (20000-this.time)/10 if (20000-this.time)/10 > 0
      this.time += config.interval
      if this.time > 1000*60 and this.penalty > 50 and window.infinity
        this.stop = true
      ctx.restore()
    move: ->
      this.x += (this.speed*config.interval/1000)*Math.cos(this.deg)
      this.y += (this.speed*config.interval/1000)*Math.sin(this.deg)
      this.x = 0.8*this.x+0.2*this.x0
      this.y = 0.8*this.y+0.2*this.y0
      this.x0 = this.x
      this.y0 = this.y
      degSum = 0
      
      for i in [0...this.sensors.length]
        if this.sensors[i] == 1
          degSum += this.weights[i]*Math.PI/180
        this.sensors0[i] = this.sensors[i]
      
      degSum = 3*Math.PI/180 if degSum > 3*Math.PI/180
      degSum = -3*Math.PI/180 if degSum < -3*Math.PI/180 
      this.deg += degSum

  # # # # # # # # # # # # # end class

  setInterval (-> draw()),  config.interval 

  #loop function
  draw = () ->
    ctx.clearRect(0, 0,can.w, can.h)
    drawTrack()
    if objects[1].length > 0
      last = objects[generation][objects[generation].length-1]
      last.draw()
      
      if !window.pause and window.start
        last.getData()
        last.move()
        if !last.stop
          last.move()
        else
          population++
          generation = Math.ceil(population/inPopulation)
          $('.info').text('Generation:'+generation+' Individual:'+population%inPopulation)
          if generation > 1
            errsum = 0
            worst = 0
            for object in objects[generation-1]
              errsum += object.penalty
              if object.penalty > worst
                worst = object.penalty
            probsums = []
            probs = []
            j = 0
            for object in objects[generation-1]
              object.prob = (worst-object.penalty+1)/(errsum+1)*100
              probs[j] = object.prob
              probsums[j] = 0
              for i in [0..j]
                probsums[j] += objects[generation-1][i].prob
              j++
            randNum  =  Math.random()*probsums[probsums.length-1]
            randNum2 =  Math.random()*probsums[probsums.length-1]
            for i in [0...probsums.length]
              if randNum < probsums[i]
                parent1index = i
                break
            for i in [0...probsums.length]
              if randNum2 < probsums[i]
                parent2index = i
                break
            while parent2index == parent1index
              randNum2 =  Math.random()*probsums[probsums.length-1]
              for i in [0...probsums.length]
                if randNum2 < probsums[i]
                  parent2index = i
                  break
            parent1 = objects[generation-1][parent1index]
            parent2 = objects[generation-1][parent2index]
            randBorder = Math.round(Math.random()*5)+2
            newW = []
            for i in [0...randBorder]
              newW[i] = objects[generation-1][parent1index].weights[i]
            for i in [randBorder...9]
              newW[i] = objects[generation-1][parent2index].weights[i]
            if !objects[generation]
              objects[generation] = []
            objects[generation].push(new LF(newW))
          else 
            if !objects[generation]
              objects[generation] = []
            objects[generation].push new LF
        
    
