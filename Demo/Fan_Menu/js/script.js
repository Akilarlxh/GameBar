var menu = [{
    title: '互联网网站资源管理',
    subtitle: ['一级菜单', '二级菜单', '三级菜单']
  },
  {
    title: '移动互联网应用管理',
    subtitle: ['一级菜单', '二级菜单', '三级菜单', '四级菜单']
  },
  {
    title: '微信公众号监测',
    subtitle: ['一级菜单', '二级菜单', '三级菜单', '四级菜单']
  },
  {
    title: '信息安全风险监测',
    subtitle: ['一级菜单', '二级菜单', '三级菜单', '四级菜单']
  },
  {
    title: '协同联动',
    subtitle: ['一级菜单', '二级菜单', '三级菜单', '四级菜单']
  },
  {
    title: '综合管理',
    subtitle: ['一级菜单', '二级菜单', '三级菜单', '四级菜单']
  },
  {
    title: '智慧党建',
    subtitle: ['一级菜单', '二级菜单', '三级菜单', '四级菜单']
  },
  {
    title: '信息发布',
    subtitle: ['一级菜单', '二级菜单', '三级菜单', '四级菜单']
  },
  {
    title: '共享知识库',
    subtitle: ['一级菜单', '二级菜单', '三级菜单', '四级菜单']
  },
  {
    title: '共享知识库',
    subtitle: ['一级菜单', '二级菜单', '三级菜单', '四级菜单']
  }
]
renderMenu(menu)

function renderMenu(menu) {
  var lis = ''
  const deg = 90
  var p2 = document.getElementById('p2')
  for (var i = 0; i < menu.length; i++) {
    var sublis = ''
    var rotateDeg = deg / menu.length
    for (var j = 0; j < menu[i].subtitle.length; j++) {
      var subrotateDeg = deg / menu[i].subtitle.length
      var lineHeight = 600 / menu[i].subtitle.length + 40
      sublis += '<li>' +
        '<a style="transform: rotate(' + (subrotateDeg * j) + 'deg);line-height:' + lineHeight + 'px" href="javascript:;">' +
        '<span>' + menu[i].subtitle[j] + '</span>' +
        '</a>' +
        '</li>'
    }
    var ul = ' <ul class="p3 a' + menu[i].subtitle.length + '">' + sublis + '</ul>'
    lis += '<li class="s2">' +
      '<a style="transform: rotate(' + (rotateDeg * i) + 'deg);" href="javascript:;"><span>' + menu[i].title + '</span></a>' +
      '' + ul + '' +
      '</li>'
  }
  p2.innerHTML = lis
}
