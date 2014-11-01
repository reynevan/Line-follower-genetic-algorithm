(function() {
  jQuery(function($) {
    var LF, can, canvas, config, ctx, draw, drawTrack, generation, inPopulation, mouse, objects, population, rand;
    canvas = document.getElementById('can');
    can = {
      w: 800,
      h: 800
    };
    canvas.width = can.w;
    canvas.height = can.h;
    ctx = canvas.getContext('2d');
    window.infinity = true;
    mouse = {
      down: false,
      x: 0,
      y: 0
    };
    config = {
      interval: 20
    };
    inPopulation = 10;
    window.track = [];
    window.pause = false;
    window.drawing = false;
    $(document).on('keydown', function(event) {
      if (event.keyCode === 80) {
        return window.pause = !window.pause;
      }
    });
    $('#population').on('change', function() {
      var generation, population;
      population = 1;
      generation = 1;
      return inPopulation = $(this).val();
    });
    $('#infinity').on('change', function() {
      if ($(this).prop('checked')) {
        return window.infinity = true;
      } else {
        return window.infinity = false;
      }
    });
    $('#btn-pause').on('click', function() {
      return window.pause = !window.pause;
    });
    $('#btn-next').on('click', function() {
      return objects[generation].slice(0).pop().stop = true;
    });
    $('#btn-place').on('click', function() {
      window.placing = 1;
      window.drawing = false;
      return $('#btn-draw').text('Draw track');
    });
    $('#btn-start').on('click', function() {
      return window.start = true;
    });
    $('#btn-draw').on('click', function() {
      if (!window.drawing) {
        $(this).text('Ready');
      } else {
        $(this).text('Draw track');
      }
      return window.drawing = !window.drawing;
    });
    $('#can').on('mousedown', function(event) {
      mouse.down = true;
      mouse.x = event.pageX;
      mouse.y = event.pageY;
      if (window.placing === 1) {
        LF.x = mouse.x;
        LF.y = mouse.y;
        objects[1].push(new LF());
        return window.placing = 2;
      } else if (window.placing === 2) {
        LF.deg = Math.atan2(mouse.y - LF.y, mouse.x - LF.x);
        objects[1][0].deg = LF.deg;
        return window.placing = 0;
      }
    });
    $('#can').on('mouseup', function(event) {
      return mouse.down = false;
    });
    $('#can').on('mousemove', function(event) {
      mouse.x = event.pageX;
      mouse.y = event.pageY;
      if (mouse.down && window.drawing) {
        track.push({
          x: mouse.x,
          y: mouse.y
        });
      }
      if (window.placing === 2) {
        LF.deg = Math.atan2(mouse.y - LF.y, mouse.x - LF.x);
        return objects[1][0].deg = LF.deg;
      }
    });
    drawTrack = function() {
      var i, _i, _ref;
      if (window.track.length > 1) {
        ctx.save();
        ctx.lineWidth = 10;
        ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.moveTo(window.track[0].x, window.track[0].y);
        for (i = _i = 0, _ref = window.track.length - 1; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          ctx.lineTo(window.track[i + 1].x, window.track[i + 1].y);
        }
        ctx.stroke();
        return ctx.restore();
      }
    };
    rand = function(n) {
      return Math.random() * 2 * n - n;
    };
    generation = 1;
    population = 1;
    objects = [];
    objects[1] = [];
    LF = (function() {
      LF.x = 558;

      LF.y = 752;

      LF.deg = 0;

      function LF(weights) {
        var i, _i, _ref;
        console.log('population:' + population + ' gen:' + generation);
        this.sensors = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        if (!weights) {
          this.weights = [rand(6), rand(6), rand(6), rand(6), rand(6), rand(6), rand(6), rand(6), rand(6)];
        } else {
          this.weights = weights;
          for (i = _i = 0, _ref = this.weights.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            if (Math.random() > 0.9) {
              this.weights[i] += rand(1);
            }
          }
        }
        this.x = LF.x;
        this.y = LF.y;
        this.deg = LF.deg;
        this.speed = 130;
        this.penalty = 0;
        this.errCount = 0;
        this.stop = false;
        this.time = 0;
        this.len = 20;
      }

      LF.prototype.draw = function() {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = '#f50';
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#09c';
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(this.x + 20 * Math.sin(this.deg) + this.len * Math.cos(this.deg), this.y - 20 * Math.cos(this.deg) + this.len * Math.sin(this.deg));
        ctx.lineTo(this.x - 20 * Math.sin(this.deg) + this.len * Math.cos(this.deg), this.y + 20 * Math.cos(this.deg) + this.len * Math.sin(this.deg));
        ctx.stroke();
        ctx.closePath();
        return ctx.restore();
      };

      LF.prototype.getData = function() {
        var center, i, pixel, whitePixels, x, x0, y, y0, _i, _ref;
        ctx.save();
        ctx.fillStyle = '#f00';
        center = Math.ceil(this.sensors.length / 2);
        whitePixels = 0;
        ctx.fillStyle = '#f00';
        ctx.shadowColor = '#f00';
        ctx.shadowBlur = 3;
        for (i = _i = 0, _ref = this.sensors.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          x0 = this.x + 20 * Math.sin(this.deg) + this.len * Math.cos(this.deg) - Math.sin(this.deg) * i * 40 / (this.sensors.length - 1);
          y0 = this.y - 20 * Math.cos(this.deg) + this.len * Math.sin(this.deg) + Math.cos(this.deg) * i * 40 / (this.sensors.length - 1);
          x = x0 + (3 * Math.cos(this.deg));
          y = y0 + (3 * Math.sin(this.deg));
          pixel = ctx.getImageData(x, y, 1, 1);
          if (pixel.data[3] > 10) {
            this.sensors[i] = 1;
            ctx.fillRect(x0, y0, 1, 1);
            if (i === center) {
              this.penalty += 1;
              console.log(this.penalty);
            }
          } else {
            this.sensors[i] = 0;
            whitePixels++;
          }
        }
        if (whitePixels === this.sensors.length) {
          this.errCount++;
        }
        if (this.errCount > 5) {
          this.stop = true;
          if ((20000 - this.time) / 10 > 0) {
            this.penalty += (20000 - this.time) / 10;
          }
        }
        this.time += config.interval;
        if (this.time > 1000 * 60 && penalty > 50 && window.infinity) {
          this.stop = true;
        }
        return ctx.restore();
      };

      LF.prototype.move = function() {
        var i, _i, _ref, _results;
        this.x += (this.speed * config.interval / 1000) * Math.cos(this.deg);
        this.y += (this.speed * config.interval / 1000) * Math.sin(this.deg);
        _results = [];
        for (i = _i = 0, _ref = this.sensors.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (this.sensors[i] === 1) {
            _results.push(this.deg += this.weights[i] * Math.PI / 180);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      return LF;

    })();
    setInterval((function() {
      return draw();
    }), config.interval);
    return draw = function() {
      var errsum, i, j, last, newW, object, parent1, parent1index, parent2, parent2index, probs, probsums, randBorder, randNum, randNum2, worst, _i, _j, _k, _l, _len, _len1, _m, _n, _o, _p, _ref, _ref1, _ref2, _ref3, _ref4;
      ctx.clearRect(0, 0, can.w, can.h);
      drawTrack();
      if (objects[1].length > 0) {
        last = objects[generation][objects[generation].length - 1];
        last.draw();
        if (!window.pause && window.start) {
          last.getData();
          last.move();
          if (!last.stop) {
            return last.move();
          } else {
            population++;
            generation = Math.ceil(population / inPopulation);
            $('.info').text('Generation:' + generation + ' Individual:' + population % inPopulation);
            if (generation > 1) {
              errsum = 0;
              worst = 0;
              _ref = objects[generation - 1];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                object = _ref[_i];
                errsum += object.penalty;
                if (object.penalty > worst) {
                  worst = object.penalty;
                }
              }
              probsums = [];
              probs = [];
              j = 0;
              _ref1 = objects[generation - 1];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                object = _ref1[_j];
                object.prob = (worst - object.penalty + 1) / (errsum + 1) * 100;
                probs[j] = object.prob;
                probsums[j] = 0;
                for (i = _k = 0; 0 <= j ? _k <= j : _k >= j; i = 0 <= j ? ++_k : --_k) {
                  probsums[j] += objects[generation - 1][i].prob;
                }
                j++;
              }
              randNum = Math.random() * probsums[probsums.length - 1];
              randNum2 = Math.random() * probsums[probsums.length - 1];
              for (i = _l = 0, _ref2 = probsums.length; 0 <= _ref2 ? _l < _ref2 : _l > _ref2; i = 0 <= _ref2 ? ++_l : --_l) {
                if (randNum < probsums[i]) {
                  parent1index = i;
                  break;
                }
              }
              for (i = _m = 0, _ref3 = probsums.length; 0 <= _ref3 ? _m < _ref3 : _m > _ref3; i = 0 <= _ref3 ? ++_m : --_m) {
                if (randNum2 < probsums[i]) {
                  parent2index = i;
                  break;
                }
              }
              while (parent2index === parent1index) {
                randNum2 = Math.random() * probsums[probsums.length - 1];
                for (i = _n = 0, _ref4 = probsums.length; 0 <= _ref4 ? _n < _ref4 : _n > _ref4; i = 0 <= _ref4 ? ++_n : --_n) {
                  if (randNum2 < probsums[i]) {
                    parent2index = i;
                    break;
                  }
                }
              }
              parent1 = objects[generation - 1][parent1index];
              parent2 = objects[generation - 1][parent2index];
              randBorder = Math.round(Math.random() * 5) + 2;
              newW = [];
              for (i = _o = 0; 0 <= randBorder ? _o < randBorder : _o > randBorder; i = 0 <= randBorder ? ++_o : --_o) {
                newW[i] = objects[generation - 1][parent1index].weights[i];
              }
              for (i = _p = randBorder; randBorder <= 9 ? _p < 9 : _p > 9; i = randBorder <= 9 ? ++_p : --_p) {
                newW[i] = objects[generation - 1][parent2index].weights[i];
              }
              if (!objects[generation]) {
                objects[generation] = [];
              }
              return objects[generation].push(new LF(newW));
            } else {
              if (!objects[generation]) {
                objects[generation] = [];
              }
              return objects[generation].push(new LF);
            }
          }
        }
      }
    };
  });

}).call(this);
