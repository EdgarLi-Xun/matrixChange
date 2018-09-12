import { Matrix } from './Matrix'
import { containerLayout, initDom } from './initHtml'

function getRandom(min, max) {
  return Math.round(Math.random() * (max - min)) + min
}

function getRandomStr(num) {
  let str = ''
  let arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  for (var i = 0; i < num; i++) {
    str += arr[getRandom(0, arr.length)]
  }
  return str
}

let defaultOption = {
  nameSpace: getRandomStr(8),
  row: 7,
  col: 9
}

export function makeMatrixChange(dom, option) {
  option = Object.assign(defaultOption, option)

  containerLayout(option.nameSpace, option.row, option.col)
  let domMatrix = initDom(dom, option.nameSpace, option.row, option.col)

  let ma = new Matrix(option.row, option.col)
  let image = option.images[0]

  domMatrix.forEach(domArray => {
    domArray.forEach(dom => {
      dom.dataset.oldclass = dom.className
    })
  })

  ma.$on('changeStart', () => {
    image = option.images[getRandom(0, option.images.length - 1)]
  })

  ma.$on('hitPoint', ({ point, mode, option }) => {
    image = option.image ? option.image : image
    let className = option.className ? option.className : 'defaultChange'
    let classNameIn = ''

    let dom = domMatrix[point.x][point.y]
    if (dom.dataset.change) {
      return
    }

    ma.$emit('changeStart')
    if (option.animate) {
      let aniFlag = 0

      let listenAnimation = function () {
        dom.className = dom.dataset.oldclass
        if (aniFlag === 1) {
          ma.$emit('changeEnd')
          dom.removeEventListener('animationend', listenAnimation)
          return
        }
        dom.children[0].style.backgroundImage = `url(${image})`
        setTimeout(() => {
          dom.className = `${oldClass} ${classNameIn}`
        })
        aniFlag = 1
      }

      className = option.classNameOut
      classNameIn = option.classNameIn ? option.classNameIn : option.classNameOut

      dom.addEventListener('animationend', listenAnimation)
    } else {
      let listenTransition = function () {
        ma.$emit('changeEnd')
        dom.dataset.mchange = ''
        dom.children[0].style.backgroundImage = `url(${image})`
        dom.className = dom.dataset.oldclass
        dom.removeEventListener('transitionend', listenTransition)
      }

      dom.addEventListener('transitionend', listenTransition)
    }

    let oldClass = dom.dataset.oldclass
    dom.className = `${oldClass} ${className}`
    dom.dataset.mchange = '1'
    dom.style.transition = mode.duration / 1000 + 's'
  })

  return {
    movePoint: ma.movePoint.bind(ma),
    changeImages(images) {
      option.images = images
    },
    matrixChange: ma
  }
}