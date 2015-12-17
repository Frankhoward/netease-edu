/*
 *  常用方法集合
 *  用法:
 *  var fc = Func$();
 *  fc.method();
 */
;
(function(global) {
  var Fn = function() {
    return new Fn.init();
  }

  Fn.prototype = {
    /*
     * 添加一个类名到节点
     * @param {'object'} node要改变的节点
     * @param {'string'} className要添加的类名
     */
    addClass: function(node, className) {
      var classList = node.className;
      if (classList.indexOf(className) === -1) {
        classList += ' ' + className;
      }
      node.className = classList;
    },

    /*
     * 从特定节点移除一个类名
     * @param {'object'} node要改变的节点
     * @param {'string'} className要删除的类名
     */
    removeClass: function(node, className) {
      var classList = node.className;
      if (classList.indexOf(className) !== -1) {
        classList = classList.replace(className, "");
      }
      node.className = classList;
    },

    /*
     * 添加一个覆盖全屏的半透明遮罩
     * @param {'object'} appendPos添加遮罩的位置（一般为body）
     * @param {'string'} zIndex遮罩的z轴属性
     * @returns {'string'} id所创建的遮罩id（用于后续操作，如删除）
     */
    createMask: function(appendPos, zIndex) {
      var id = "",
        html = "";
      while (true) {
        id = 'id' + Math.ceil(Math.random() * 99999) + 1;
        if (document.getElementById(id) === null) {
          break;
        }
      }
      var mask = document.createElement('div');
      mask.id = id;
      mask.style.position = 'fixed';
      if (!this.isOldBrowser()) {
        mask.style.background = 'rgba(0, 0, 0, 0.5)';
      } else {
        mask.style.background = 'url("img/ie8-mask.png")';
      }
      mask.style.padding = '0';
      mask.style.width = '100%';
      mask.style.height = '100%';
      mask.style.top = '0';
      mask.style.zIndex = zIndex + '';

      appendPos.appendChild(mask);
      return id;
    },

    /*
     * 通过给定的id值删除一个节点
     * @param {'string'} id需要删除的节点的id
     */
    removeNodeById: function(id) {
      var element = document.getElementById(id);
      element.parentNode.removeChild(element);
    },

    /*
     * 使用替换图片的方法为一个img元素模拟一个类似鼠标移入高亮的效果
     * @param {'object'} btn需要创建效果的元素，必需为img
     * @param {'string'} orgImg原始图片
     * @param {'string'} hoverImg鼠标移入后要替换的图片
     */
    btnHoverEffect: function(btn, orgImg, hoverImg) {
      btn.onmouseover = function() {
        btn.setAttribute('src', hoverImg);
      }
      btn.onmouseout = function() {
        btn.setAttribute('src', orgImg);
      }
    },

    /*
     * 取得cookie的名与对应的值。
     * @param {'string'} name需要取得值的cookie名
     * @returns {'string'} 如果找到name，返回'name=value'的名值对，否则返回“”（空字符串）
     */
    getCookie: function(name) {　　　　
      if (document.cookie.length > 0) {      　　　　　　
        start = document.cookie.indexOf(name + "=");
        if (start != -1) {
          start = start + name.length + 1;
          end = document.cookie.indexOf(";", start);
          if (end == -1) {
            end = document.cookie.length;
          }
          return unescape(document.cookie.substring(start, end));　　　　
          }
      }
      return ""　
    },

    /*
     * 设置一个cookie
     * @param  {string} name cookie的名字
     * @param  {string} value cookie对应的值
     */
    setCookie: function(name, value) {
      document.cookie = name + "=" + value;
    },

    /*
     * 向特定的url请求ajax数据
     * @param {string} url 要请求的地址
     * @param {string} method 请求方法（‘GET’或‘POST’）
     * @param {function} callback ajax请求成功后要调用的函数
     */
    ajaxRequest: function(url, method, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          callback(xhr.responseText);
        }
      }
      xhr.open(method, url);
      xhr.send();
    },

    /*
     * 生成一个带名值对的URL
     * @param {string} url 要请求的地址
     * @param {obj} data 名字对对象,如 {name1 : value1, name2 : value2};
     * @returns {string} 生成后的url,如：
     *                   'http://study.163.com/webDev/couresByCategory.htm?pageNo=1&psize=20&type=10'
     */
    ajaxurlGen: function(url, data) {
      var arr = [];
      for (var i in data) {
        arr.push(encodeURIComponent(i) + "=" + encodeURIComponent(data[i]));
      }
      return url + arr.join("&");
    },

    /*
     * 删除一个节点
     * @param {object} node 要删除的节点
     */
    removeElement: function(node) {
      node.parentNode.removeChild(node);
    },

    /*
     * 通过检查有无getElementsByClassName方法，检查是否为老版浏览器
     */
     isOldBrowser : function() {
       if(!document.getElementsByClassName) return true;
       return false;
     }
  }

  Fn.init = function() {}

  Fn.init.prototype = Fn.prototype;

  global.Func$ = Fn;
}(window));




/*
 *  -- 轮播模块 --
 *  -------------
 *  依赖：所有要参与轮播的图片需要用absolute定位，重叠在一起，被一个父元素包裹。
 *  例:
 *  <div>  {positon: relative}
 *    <img></img> {positon: absolute; top:0; left:0;}
 *    <img></img> {positon: absolute; top:0; left:0;}
 *    <img></img> {positon: absolute; top:0; left:0;}
 *  </div>
 *  -------------
 *  用法: var slideshow = Slideshow$(imgContainer, imgList, option);
 *  @param {object} imgContainer DOM节点，轮播图的容器
 *  @param {[]} imgList 数组,所有要轮播的图片
 *  @option {object} 其它选项
 *  option = {
 *    delay : {number},  等待时间，默认为3000ms
 *    duration : {number}, 动画持续时间，默认为500ms
 *    autoplay : {boolean}, 是否自动播放，默认为false
 *    control : {object} {  是否有控制器（如轮播图下的小圆点，鼠标点击后切换到特定的图片）默认为null
 *      controlList {array}: , 控制器数组
 *      className {string}: , 控制器的类名。
 *      activeClassName {string}: 控制器被激活后的类名。
 *    },
 *    centerCrop : {
 *      containerWidth {number}: , 当视窗小于containerWidth时，裁剪轮播图的两边，让轮播图保持在中心，默认为null
 *    },
 *    stopPlayWhenHover {boolean}:  当鼠标移入后，轮播图停止自动轮播，默认为false
 *  }
 */
;
(function(global) {
  var Slideshow = function(container, imgList, option) {
    return new Slideshow.init(container, imgList, option);
  }
  Slideshow.prototype = {

    // 初始化所有选项
    __initOption : function(option) {
      var self = this
      temp = {};
      temp.delay = option.delay || 3000;
      temp.duration = option.duration || 500;
      temp.autoplay = option.autoplay || false;
      temp.curIndex = option.curIndex || 0;
      temp.control = option.control || null;
      temp.centerCrop = option.centerCrop || null;
      temp.stopPlayWhenHover = option.stopPlayWhenHover || false;
      return temp;
    },

    // 播放下一张图片
    __playnext : function() {
      var self = this;
      var nextIndex = self.__option.curIndex + 1 < self.__imgList.length ? self.__option.curIndex + 1 : 0;
      self.__fadein(self.__imgList[self.__option.curIndex], self.__imgList[nextIndex]);
      self.__switchControl('u-nav-control', 'u-nav-control-active', nextIndex);
      self.__option.curIndex++;
      if (self.__option.curIndex === self.__imgList.length) {
        self.__option.curIndex = 0;
      }
    },

    /*
     * 将控制器的activeClassName赋值给特定的index
     */
    __switchControl : function(className, activeClassName, index) {
      var self = this;
      var controlList = self.__option.control.controlList;
      for (var i = 0; i < controlList.length; i++) {
        controlList[i].className = className;
      }
      controlList[index].className += ' ' + activeClassName;
    },

    /*
     * 开启自动播放
     */
    autoplay : function() {
      var self = this;
      var duration = 0;
      var play = function() {
        clearInterval(self.__timer);
        duration = self.__option.duration;
        self.__playnext();
        self.__timer = setInterval(play, self.__option.delay + duration);
      }
      self.__timer = setInterval(play, self.__option.delay);
    },

    /*
     * 若视窗小于width，裁剪轮播图容器以使轮播图保持局中
     */
    centerCrop : function(width) {
      var self = this;
      var outerContainer = self.__option.centerCrop.outerContainer;

      if (window.addEventListener) {
         window.addEventListener("resize", center, false);
      } else if (window.attachEvent) {
         window.attachEvent("onresize", center);
      }

      function center() {
        var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        if (windowWidth < width) {
          self.__container.style.left = -(width - windowWidth) / 2 + 'px';
        } else {
          self.__container.style.left = '0px';
        }
      }
      center();

    },


    /*
     * 当鼠标移入轮播图容器时，停止自动播放。
     */
    __stopWhenHover : function() {
      var self = this;
      self.__container.onmouseover = function() {
        clearInterval(self.__timer);
      };
      self.__container.onmouseout = function() {
        self.autoplay();
      };
    },

    /*
     * 初始化控制器，为每个控制器添加事件。
     */
    __initControl : function() {
      var self = this;
      var controlList = self.__option.control.controlList;
      var className = self.__option.control.className;
      var activeClassName = self.__option.control.activeClassName;

      for (var i = 0; i < controlList.length; i++) {
        controlList[i].index = i;
        controlList[i].onmousedown = function() {
          if (this.index !== self.__option.curIndex) {
            self.__fadein(self.__imgList[self.__option.curIndex], self.__imgList[this.index]);
            self.__option.curIndex = this.index;
            self.__switchControl('u-nav-control', 'u-nav-control-active', this.index);
          }
        }
      }
    },

    /*
     * 淡入效果
     * @param {object} eleToHide 需要隐藏的对象
     * @param {object} eleToshow 需要显示的对象
     */
    __fadein : function fadein(eleToHide, eleToShow) {
      var imgList = this.__imgList;
      var duration = this.__option.duration;

      for (var i = 0; i < imgList.length; i++) {
        imgList[i].style.zIndex = 0;
      }
      eleToHide.style.zIndex = 1;
      eleToShow.style.zIndex = 2;
      var stepLength = 1 / 50;
      var interval = duration * stepLength;
      eleToShow.style.opacity = 0;

      function step() {
        if (parseFloat(eleToShow.style.opacity) - stepLength < 1) {
          eleToShow.style.opacity = parseFloat(eleToShow.style.opacity) + stepLength;
        } else {
          eleToShow.style.opacity >= 1;
          eleToShow.style.opacity = 1;
          clearInterval(setIntervalId);
        }
      }
      var setIntervalId = setInterval(step, interval);
    },

  }

  /*
   * 初始化 slideshow 对象
   */
  Slideshow.init = function(container, imgList, option) {
    var self = this;
    self.__container = container || null;
    self.__imgList = imgList || null;
    self.__option = self.__initOption(option);
    self.__timer = null;
    if (self.__imgList) {
      self.__imgList[self.__option.curIndex].style.zIndex = 2;
    }
    if (self.__option.control) {
      self.__initControl();
    }
    if (self.__option.autoplay) {
      self.autoplay();
    }
    if (self.__option.stopPlayWhenHover) {
      self.__stopWhenHover();
    }
    if (self.__option.centerCrop) {
      self.centerCrop(self.__option.centerCrop.containerWidth);
    }
  }

  Slideshow.init.prototype = Slideshow.prototype;

  global.Slideshow$ = Slideshow;
}(window));



/*
 * --分页器模块--
 * ------------
 * 生成一个分页器, html结构如下：
 *   <div class="m-pagination" id="id39059">    //ID为随机生成的唯一id
 *       <span class="prev"></span>             //前一页
 *       <ul class="pageList">                  //页面列表容器
 *           <li class="active">1</li>          //第n页，active代表当前选中页面
 *           <li>2</li>
 *           <li>3</li>
 *           <li>4</li>
 *           <li>5</li>
 *           <li>6</li>
 *           <li>7</li>
 *           <li>8</li>
 *       </ul>
 *       <span class="next"></span>             //后一页
 *   </div>
 * -------------
 * 用法：var pagi = Pagination$(appendPos, func, option);
 * pagi.method();
 * ----------------------------------------------------
 * @param {object} appendPos 分页器附着的节点
 * @param {function} func 页面改变后需要调用的函数
 * @param {object} option 其它选项
 * option {
 *  totalPage: {number} 总页数, 默认为1
 *  pagiLength: {number} 分页器一次所显示的页面数量，默认为1(pagiLength应小于等于totalPage)
 *  hasPrev: {boolean} 是否有前一页按钮，默认为false
 *  hasNext: {boolean} 是否有后一页按钮，默认为false
 * }
 */
;
(function(global) {

  var Pagination = function(appendPos, func, option) {
    return new Pagination.init(appendPos, func, option);
  }

  Pagination.prototype = {

    /*
     * 调用此函数更新分页器，此函数执行完毕会调用__addEventToPageList为更新后的
     * 分页器添加事件。
     */
    __refreshPagi: function(appendPos, id, option) {
      var self = this;
      var html = '<div class="m-pagination" id="' + id + '">';
      if (option.hasPrev) {
        html += '<span class="prev"></span>';
      }
      html += '<ul class="pageList">';
      var midPoint = Math.ceil(option.pagiLength / 2);
      var isCurPageInMid = option.curPage - midPoint > 0 && option.curPage <= (option.totalPage - midPoint);
      var isCurPageInEnd = option.curPage > (option.totalPage - midPoint);
      var pos = isCurPageInMid ? midPoint : (option.curPage - 1);


      var startPage;
      if (isCurPageInMid) {
        startPage = option.curPage - midPoint;
        pos = midPoint;
      } else if (isCurPageInEnd) {
        startPage = option.totalPage - option.pagiLength + 1;
        pos = option.pagiLength - (option.totalPage - option.curPage) - 1;
      } else {
        pos = option.curPage - 1;
        startPage = 1;
      }
      for (var i = 0; i < option.pagiLength; i++, startPage++) {
        if (i === pos) {
          html += '<li class="active">' + (startPage) + '</li>';
        } else {
          html += '<li>' + (startPage) + '</li>';
        }
      }

      html += '</ul>';
      if (option.hasNext) {
        html += '<span class="next"></span>'
      }
      html += '</div>'
      appendPos.innerHTML = html;

      var list = document.getElementById(id).getElementsByTagName('li');
      var prev = document.getElementById(id).querySelectorAll('.prev')[0];
      var next = document.getElementById(id).querySelectorAll('.next')[0];

      self.__addEventToPageList(list, prev, next, self.func);
    },

    /*
     * 为分页器添加事件。
     */
    __addEventToPageList: function(list, prev, next, func) {
      var self = this;
      for (i = 0; i < list.length; i++) {
        list[i].index = i;
        list[i].onmousedown = function() {
          if (parseInt(this.innerHTML) !== self.__option.curPage) {
            self.__option.curPage = parseInt(this.innerHTML);
            self.__refreshPagi(self.append, self.__listId, self.__option);
            func();
          }
        }
      }
      if (prev) {
        prev.onmousedown = function() {
          if (self.__option.curPage !== 1) {
            self.__option.curPage -= 1;
            self.__refreshPagi(self.append, self.__listId, self.__option);
            func();
          }
        }
      }
      if (next) {
        next.onmousedown = function() {
          if (self.__option.curPage !== self.__option.totalPage) {
            self.__option.curPage += 1;
            self.__refreshPagi(self.append, self.__listId, self.__option);
            func();
          }
        }
      }
    },

    /*
     * 生成一个唯一的ID。
     */
    __genListId: function() {
      var id = '';
      while (true) {
        id = 'id' + Math.ceil(Math.random() * 99999);
        if (document.getElementById(id) === null) {
          break;
        }
      }
      return id;
    },

    /*
     * 得到当前的页面
     */
    getCurPage: function() {
      return this.__option.curPage;
    },

    /*
     * 为分页器设置新的选项
     */
    setOption: function(option) {
      if (option.curPage) {
        this.__option.curPage = option.curPage;
      }
      if (option.pagiLength) {
        this.__option.pagiLength = option.pagiLength;
      }
      if (option.totalPage) {
        this.__option.totalPage = option.totalPage;
      }
      if (option.hasPrev) {
        this.__option.hasPrev = true;
      }
      if (option.hasNext) {
        this.__option.hasNext = true;
      }
    },

    /*
     * 调用此函数会更新分页器，一般在setOption后使用
     */
    show: function() {
      this.__refreshPagi(this.append, this.__listId, this.__option);
    },

    /*
     * 调用此函数会重置当前页面为第一页。
     */
    reset: function() {
      this.__option.curPage = 1;
      this.__refreshPagi(this.append, this.__listId, this.__option);
    }
  }

  Pagination.init = function(appendPos, func, option) {
    var self = this;
    self.append = appendPos;
    self.func = func;
    self.__option = {
      curPage : 1,
      totalPage: 1,
      pagiLength: 1,
      hasPrev: false,
      hasNext: false
    };
    self.__listId = self.__genListId();
    if (option) {
      self.setOption(option);
    }
  }

  Pagination.init.prototype = Pagination.prototype;

  global.Pagination$ = Pagination;

}(window));


/*
 * 轮播图实现，使用Slideshow$。
 */
(function(){
  var imgContainer = document.getElementById('slide-container1');
  var imgList = imgContainer.querySelectorAll('.m-slide-imglist')[0].getElementsByTagName('img');
  var option = {
    delay : 5000,
    duration : 500,
    autoplay : true,
    control : {
      controlList : document.getElementById('controlList1').querySelectorAll('.u-nav-control'),
      className : 'u-nav-control',
      activeClassName : 'u-nav-control-active'
    },
    centerCrop : {
      containerWidth : 1652,
    },
    stopPlayWhenHover : true
  }
  var slideshow = Slideshow$(imgContainer, imgList, option);
}());

/*
 * 左列，产品设计，编程语言交互实现
 */
(function() {
  /*
   * 此函数处理左侧课程列表,将课程列表附着到appendPos上。
   * @param {object} appendPos 课程列表的附着点。
   * @data {array} data包含从后端获取的所需要的课程数据。
   */
  function processCourse(appendPos, data) {
    var list = data;
    var html = "";
    for (var i = 0; i < list.length; i += 1) {
      html += '<li class="m-course-item f-ff1 f-fs-12">';
      html += '<img class="u-course-img" alt="课程图片" src="' + list[i].middlePhotoUrl + '">';
      html += '<p class="u-course-name">' + list[i].name + '</p>';
      html += '<p class="u-course-institute">' + list[i].provider + '</p>';
      html += '<p class="u-course-students">' + list[i].learnerCount + '</p>';
      if (list[i].price === 0) {
        html += '<p class="u-course-price">免费</p>'
      } else {
        html += '<p class="u-course-price">¥ ' + list[i].price + '</p>'
      }

      html += '<div class="m-course-popup">'
      html += '<img class="u-course-img f-fl" alt="课程图片" src="' + list[i].middlePhotoUrl + '">';
      html += '<p class="u-course-name f-fl f-fs-18">' + list[i].name + '</p>';
      html += '<p class="u-course-students f-fl">' + list[i].learnerCount + ' 人在学</p>';
      html += '<p class="u-course-institute f-fl"> 发布者：' + list[i].provider + '</p>';
      if (list[i].categoryName === null) {
        html += '<p class="u-course-category f-fl"> 分类：无</p>';
      } else {
        html += '<p class="u-course-category f-fl"> 分类：' + list[i].categoryName + '</p>';
      }
      html += '<div class="u-course-description-container"><p class="u-course-description f-fl f-fs-14">' + list[i].description + '</p></div>';
      html += '</div>';
      html += '</li>'
    }
    appendPos.innerHTML = html;

    var courseList = appendPos.querySelectorAll('.m-course-item');
    for (var i = 0; i < courseList.length; i++) {
      courseList[i].index = i;
      courseList[i].onmouseout = function() {
        this.querySelectorAll('.m-course-popup')[0].style.display = 'none';
      }
      courseList[i].onmouseover = function() {
        this.querySelectorAll('.m-course-popup')[0].style.display = 'block';
      }
    }
  }

  // 用ajax创建的课程列表附着位置
  var pos = document.querySelectorAll('.m-pagination-container')[0];
  // 常用函数对象
  var fc = Func$();
  // ajax请求的url
  var urlholder = 'http://study.163.com/webDev/couresByCategory.htm?'
  // 默认的请求type
  var type = 10;

  // 创建一个分页器对象，定义了分页器每次改变会使用fc.ajaxRequest来请求新数据。
  // 这里只创建了分页器对象，以及定义了其行为，并未显示在页面。
  var pagi = Pagination$(pos, function() {
    var url = fc.ajaxurlGen(urlholder, {
      'pageNo': pagi.getCurPage(),
      'psize': 20,
      'type': type
    });
    fc.ajaxRequest(url, 'GET', function(data) {
      var courseData = JSON.parse(data);
      processCourse(document.getElementById('courseList'), courseData.list);
    });
  });

  // 取得产品设计和编程语言两个tab按钮对象
  var uBtnDesign = document.getElementById('uBtnDesign');
  var uBtnProgramLan = document.getElementById('uBtnProgramLan');

  // 给产品设计按钮添加事件，每次点击会改变为对应的type值，请求新的数据，重置分页器当前页面为第一页
  uBtnDesign.onmousedown = function() {
    type = 10;
    var url = fc.ajaxurlGen(urlholder, {
      'pageNo': 1,
      'psize': 20,
      'type': type
    });
    fc.ajaxRequest(url, 'GET', function(data) {
      var courseData = JSON.parse(data);
      processCourse(document.getElementById('courseList'), courseData.list);
      pagi.reset();
      fc.removeClass(uBtnProgramLan, 'u-btn-active');
      fc.addClass(uBtnDesign, 'u-btn-active');
    });
  }

  // 给编程语言按钮添加事件，每次点击会改变为对应的type值，请求新的数据，重置分页器当前页面为第一页
  uBtnProgramLan.onmousedown = function() {
    type = 20;
    var url = fc.ajaxurlGen(urlholder, {
      'pageNo': 1,
      'psize': 20,
      'type': type
    });
    fc.ajaxRequest(url, 'GET', function(data) {
      var courseData = JSON.parse(data);
      processCourse(document.getElementById('courseList'), courseData.list);
      pagi.reset();
      fc.removeClass(uBtnDesign, 'u-btn-active');
      fc.addClass(uBtnProgramLan, 'u-btn-active');
    });
  }

  // 页面加载后初始化数据。在页面上显示第一页的数据信息，初始化分页器。
  var url = fc.ajaxurlGen(urlholder, {
    'pageNo': 1,
    'psize': 20,
    'type': 10
  });
  fc.ajaxRequest(url, 'GET', function(data) {
    var courseData = JSON.parse(data);
    var pagiData = courseData.pagination;
    pagi.setOption({
      curPage: pagiData.pageIndex,
      totalPage: pagiData.totlePageCount,
      hasPrev: true,
      hasNext: true,
      pagiLength: 8
    });
    pagi.show();
    processCourse(document.getElementById('courseList'), courseData.list);
  });

}());




/*
 * 视频弹窗模块实现
 */
(function() {
  var fc = Func$();
  var body = document.getElementsByTagName('body')[0];
  var maskId;

  var videoPopup = document.getElementById('video-popup');
  var opener = document.getElementById('video-opener1');
  var close = videoPopup.querySelectorAll('.u-icon-close')[0];
  var video = document.getElementsByTagName('video')[0];
  opener.onmousedown = function() {
    maskId = fc.createMask(body, 99);
    videoPopup.style.display = 'block';
  }
  close.onmousedown = function() {
    videoPopup.style.display = 'none';
    fc.removeNodeById(maskId);
    video.pause();
  }
})();

/*
 * 顶部通知栏实现
 */
(function() {
  var fc = Func$();
  var btnClose = document.getElementById('notifyBar').querySelectorAll('.u-donot-show')[0];
  btnClose.onmousedown = function() {
    fc.removeNodeById('notifyBar');
    fc.setCookie('noNotifyBar', 1);
  };
  if (fc.getCookie('noNotifyBar')) {
    fc.removeNodeById('notifyBar');
  }
})

/*
 * 右侧热门排行实现
 */
(function() {
  var fc = Func$();
  var url = 'http://study.163.com/webDev/hotcouresByCategory.htm'
  var appendPos = document.getElementById('hotlist');
  var nextToPop = 0;
  fc.ajaxRequest(url, 'GET', function(data) {
    data = JSON.parse(data);
    play(data);
    setInterval(function() {
      play(data);
    }, 5000);
  });
  function play(data) {
    var html = '';
    if (nextToPop === data.length - 10) {
      nextToPop = 0;
    }

    for (var i = nextToPop + 10; i > nextToPop; i--) {
      html += '<div class="m-hotlist-item f-cb"><div class="u-course-icon f-fl">';
      html += '<img src="' + data[i].smallPhotoUrl + '">';
      html += '</div><div class="course-detail f-fl"><p class="f-fs-14">';
      html += data[i].name + '</p>';
      html += '<p class="f-fs-12 learners">' + data[i].learnerCount + '</p></div></div>';
    }
    appendPos.innerHTML = html;
    nextToPop += 1;
  }
}());

/*
 * 顶部关注按钮
 */
(function() {
  var body = document.getElementsByTagName('body')[0];
  var fc = Func$();
  var btnFollow = document.getElementById('btn-follow');
  var maskId;

  var loginWindow = document.getElementById('loginWindow');
  var wrongAnswer = document.querySelectorAll('.u-wrong-answer')[0];
  var closeBtn = loginWindow.querySelectorAll('.u-icon-close')[0];
  var btnLogin = document.getElementById('login');
  var formUserName = document.getElementById('username');
  var formPassword = document.getElementById('password');

  if (!fc.getCookie('loginSuc')) {
    fc.btnHoverEffect(btnFollow, 'img/btn-follow.png', 'img/btn-follow-active.png');
    btnFollow.onmousedown = function() {
      maskId = fc.createMask(body, 99);
      loginWindow.style.display = 'block';
    };
    closeBtn.onmousedown = function() {
      loginWindow.style.display = 'none';
      fc.removeNodeById(maskId);
    }

    if (!btnLogin.addEventListener) {
      btnLogin.attachEvent("onclick", submitForm);
    } else {
      btnLogin.addEventListener("click", submitForm, false);
    }
    function submitForm(event) {
      (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
      var md5uname = calcMD5(formUserName.value);
      var md5password = calcMD5(formPassword.value);
      var url = fc.ajaxurlGen('http://study.163.com/webDev/login.htm?', {
        'userName': md5uname,
        'password': md5password
      });
      fc.ajaxRequest(url, 'GET', function(data) {
        if (data === '1') {
          fc.setCookie('loginSuc', 1);
          fc.ajaxRequest('http://study.163.com/webDev/attention.htm', 'GET', function(data) {
            if (data === '1') {
              fc.setCookie('followSuc', 1);
              btnFollow.setAttribute('src', 'img/btn-cancel-follow.png');
              btnFollow.onmousedown = '';
              btnFollow.onmouseover = '';
              btnFollow.onmouseout = '';
              fc.btnHoverEffect(btnFollow, 'img/btn-cancel-follow.png', 'img/btn-cancel-follow-active.png');
              loginWindow.style.display = 'none';
              fc.removeNodeById(maskId);
            };
          })
        } else {
          fc.addClass(wrongAnswer, 'u-wrong-answer-active');
          formUserName.value="";
          formPassword.value="";
        }
        formUserName.onfocus = function() {
          fc.removeClass(wrongAnswer, 'u-wrong-answer-active');
        }
        formPassword.onfocus = function() {
          fc.removeClass(wrongAnswer, 'u-wrong-answer-active');
        }
      });
    };
  } else {
    btnFollow.setAttribute('src', 'img/btn-cancel-follow.png');
    fc.btnHoverEffect(btnFollow, 'img/btn-cancel-follow.png', 'img/btn-cancel-follow-active.png');
  }
}());


/*
 * IE8兼容的自适应布局实现。
 */
(function() {
  var fc = Func$();
  if (fc.isOldBrowser()) {
    function narrowLayout() {
      var gContainer = document.querySelectorAll('.g-container');
      for (var i = 0; i < gContainer.length; i++) {
        gContainer[i].style.width = '960px';
      }
      var gContainerLeft = document.querySelectorAll('.g-container-left');
      for (var i = 0; i < gContainerLeft.length; i++) {
        gContainerLeft[i].style.width = '737px';
      }
      var mSkill = document.querySelectorAll('.m-skill');
      for (var i = 0; i < mSkill.length; i++) {
        mSkill[i].style.marginBottom = '35px';
      }
      var mSkillCol = document.querySelectorAll('.m-skill .m-skill-col');
      for (var i = 1; i < mSkillCol.length; i++) {
        mSkillCol[i].style.marginLeft = '71px';
      }
      var uSkillDetail = document.querySelectorAll('.m-skill .m-skill-col .m-skill-content .u-skill-detail');
      for (var i = 0; i < uSkillDetail.length; i++) {
        uSkillDetail[i].style.width = '154px';
      }
      var gFooterCol1 = document.querySelectorAll('.g-footer .g-footer-col1');
      for (var i = 0; i < gFooterCol1.length; i++) {
        gFooterCol1[i].style.marginLeft = '0px';
      }
    }
    function wideLayout() {
      var gContainer = document.querySelectorAll('.g-container');
      for (var i = 0; i < gContainer.length; i++) {
        gContainer[i].style.width = '1205px';
      }
      var gContainerLeft = document.querySelectorAll('.g-container-left');
      for (var i = 0; i < gContainerLeft.length; i++) {
        gContainerLeft[i].style.width = '982px';
      }
      var mSkill = document.querySelectorAll('.m-skill');
      for (var i = 0; i < mSkill.length; i++) {
        mSkill[i].style.marginBottom = '0px';
      }
      var mSkillCol = document.querySelectorAll('.m-skill .m-skill-col');
      for (var i = 1; i < mSkillCol.length; i++) {
        mSkillCol[i].style.marginLeft = '84px';
      }
      var uSkillDetail = document.querySelectorAll('.m-skill .m-skill-col .m-skill-content .u-skill-detail');
      for (var i = 0; i < uSkillDetail.length; i++) {
        uSkillDetail[i].style.width = 'auto';
      }
      var gFooterCol1 = document.querySelectorAll('.g-footer .g-footer-col1');
      for (var i = 0; i < gFooterCol1.length; i++) {
        gFooterCol1[i].style.marginLeft = '50px';
      }
    }

    function resizeWindow() {
      windowSize = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      if (windowSize < 1205) {
        narrowLayout();
      } else {
        wideLayout();
      }
    }

    var windowSize = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (windowSize < 1205) {
      wideLayout();
      narrowLayout();
    } else {
      wideLayout();
    }


    if (window.addEventListener) {
       window.addEventListener("resize", resizeWindow, false);
    } else if (window.attachEvent) {
       window.attachEvent("onresize", resizeWindow);
    }
  }

}())
