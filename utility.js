function shuffle(a) {
  var j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
}

function getScrollbarWidth() {
  var outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.width = '100px'
  // needed for WinJS apps
  outer.style.msOverflowStyle = 'scrollbar'
  document.body.appendChild(outer)
  var widthNoScroll = outer.offsetWidth
  // force scrollbars
  outer.style.overflow = 'scroll'
  // add inner div
  var inner = document.createElement('div')
  inner.style.width = '100%'
  outer.appendChild(inner)
  var widthWithScroll = inner.offsetWidth
  // remove divs
  outer.parentNode.removeChild(outer)
  return widthNoScroll - widthWithScroll
}

function getViewport(argument) {
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight || e.clientHeight || g.clientHeight
  return { x: x, y: y }
}

function checkScroll(viewport) {
  var elem = window.document.getElementById('app')
  var hasScroll = elem.scrollHeight > viewport.y
  return hasScroll
}

function getWidth(bodyWidth, padding, scrollbarWidth) {
  var viewport = getViewport()
  var _scrollbarWidth = 0
  var hasScroll = checkScroll(viewport)
  if (hasScroll) {
    _scrollbarWidth = scrollbarWidth
  }
  return bodyWidth === 'auto' ? viewport.x - (padding * 2) - _scrollbarWidth : bodyWidth
}

function calculateLine(width, singleLine, singleLineRate, isLastLine, lastLineImagesWidth, scrollbarWidth, margin, padding, size) {
  // 水平間距
  var spacing = (singleLine.length - 1) * margin
  // 單行所有圖片寬度和
  var lineImagesWidth = width - spacing
  if (isLastLine) {
    lineImagesWidth = lastLineImagesWidth > lineImagesWidth ? lineImagesWidth : lastLineImagesWidth
  }
  // 累計容器寬度
  var widthCounter = 0
  var lines = singleLine.map(function (image, index) {
    var isLastImage = index === singleLine.length - 1
    // 盒寬
    var boxWidth = Math.round(image.Rate / singleLineRate * lineImagesWidth)
    // 處理四捨五入不整除 Firefox 跑版問題
    if (isLastImage && (widthCounter + boxWidth) !== lineImagesWidth) {
      boxWidth = lineImagesWidth - widthCounter
    }
    widthCounter += boxWidth
    // 盒右間距
    var boxMarginRight = isLastImage ? 0 : margin
    // 圖寬
    var imageWidth = Math.round(image.Rate * size)
    // 圖高
    var imageHeight = size
    // 圖左間距
    var imageMarginLeft = 0
    // 圖上間距
    var imageMarginTop = 0
    // 處裡盒比圖寬的情形
    if (imageWidth < boxWidth) {
      // 將圖寬設為盒寬
      imageWidth = boxWidth
      // 將圖高依盒寬等比例增加
      imageHeight = Math.round(boxWidth / image.Rate)
      // 設定上間距以垂直置中
      imageMarginTop = Math.round((size - imageHeight) / 2)
    }
    // 處裡圖比盒寬的情形
    if (imageWidth > boxWidth) {
      imageMarginLeft = Math.round((boxWidth - imageWidth) / 2)
    }
    var line = {
      Src: image.Src,
      BoxStyle: {
        'height': size + 'px',
        'width': boxWidth + 'px',
        'margin-right': boxMarginRight + 'px',
        'display': 'inline-block',
        'float': 'left',
        'overflow': 'hidden'
      },
      ImgStyle: {
        'height': imageHeight + 'px',
        'width': imageWidth + 'px',
        'margin-left': imageMarginLeft + 'px',
        'margin-top': imageMarginTop + 'px'
      }
    }
    return line
  })
  return lines
}

function getAllLinesAndWidth(images, scrollbarWidth, bodyWidth, margin, padding, size) {
  // 總寬
  var width = getWidth(bodyWidth, padding, scrollbarWidth)
  // 全部行
  var allLines = []
  // 單行
  var singleLine = []
  // 累計長寬比
  var singleLineRateCounter = 0
  // 累計行寬
  var lineImagesWidthCounter = 0
  // 走訪 Images
  for (var i = 0; i < images.length; i++) {
    var image = images[i]
    // Rate = Width / Height
    var imageWidth = Math.round(size * image.Rate)
    // 是否大於行寬 = 累計行寬 + 當前圖片寬度一半 <= 行寬
    var isGreaterThanWidth = Math.round(lineImagesWidthCounter + imageWidth / 2) > width
    if (isGreaterThanWidth) {
      // 如果大於行寬 則斷行 運算行陣列
      var calculatedLine = calculateLine(width, singleLine, singleLineRateCounter, false, lineImagesWidthCounter, scrollbarWidth, margin, padding, size)
      // 將運算後的陣列件加入 allLines
      allLines.push(calculatedLine)
      // 重置變數
      singleLine = []
      singleLineRateCounter = 0
      lineImagesWidthCounter = 0
    }
    // 累計行寬
    lineImagesWidthCounter += imageWidth
    // 累計長寬比
    singleLineRateCounter += image.Rate
    // 將圖片加入 singleLine
    singleLine.push(image)
  }
  // 最後一行 剩餘圖片
  if (singleLine.length > 0) {
    var lastLine = calculateLine(width, singleLine, singleLineRateCounter, true, lineImagesWidthCounter, scrollbarWidth, margin, padding, size)
    allLines.push(lastLine)
  }
  return { allLines: allLines, width: width }
}
