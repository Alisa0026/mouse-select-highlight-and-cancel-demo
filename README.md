# mouse-select-highlight-and-cancel

> 版权声明：本文为博主原创文章，未经博主允许不得转载。 欢迎 Issues 留言。

当我们需要鼠标选中文本后，文本高亮。当再次将选中的文本选中后，取消高亮效果时该如何实现呢？

![效果图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/136bb22f38024e2483c26157d0c9eb48~tplv-k3u1fbpfcp-zoom-1.image)

### 一、介绍 window.getSelection

获取鼠标选中内容，主要是利用了[window.getSelection()](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/getSelection)这个 API。返回一个[Selection](https://developer.mozilla.org/zh-CN/docs/Web/API/Selection)对象，表示用户选择的文本范围或光标的当前位置。

Selection 对象所对应的是用户所选择的[ranges](https://developer.mozilla.org/zh-CN/docs/Web/API/Range)（区域），俗称拖蓝。默认情况下，该函数只针对一个区域，我们可以这样使用这个函数：

```
var selObj = window.getSelection();
var range  = selObj.getRangeAt(0);


// selObj 被赋予一个 Selection对象
// range 被赋予一个 Range 对象
```

调用[Selection.toString()](https://developer.mozilla.org/zh-CN/docs/Web/API/Selection/toString) 方法会返回被选中区域中的纯文本。要求变量为字符串的函数会自动对对象进行该处理，例如：

```
var selObj = window.getSelection();
window.alert(selObj);
```

关于 Range 的一些介绍可以看张鑫旭的这篇文章：
[JS Range HTML 文档/文字内容选中、库及应用介绍](https://www.zhangxinxu.com/wordpress/2011/04/js-range-html%E6%96%87%E6%A1%A3%E6%96%87%E5%AD%97%E5%86%85%E5%AE%B9%E9%80%89%E4%B8%AD%E3%80%81%E5%BA%93%E5%8F%8A%E5%BA%94%E7%94%A8%E4%BB%8B%E7%BB%8D/)

### 二、一些现成的第三方库

1.  [web-highlighter](https://alienzhou.github.io/web-highlighter/)
    > 这是一个很不错的“划词高亮”功能实现第三方库，直接引用就可以，实现简单。
    > 参考文章可以看[如何用 JS 实现“划词高亮”的在线笔记功能](https://www.alienzhou.com/2019/04/21/web-note-highlight-in-js/#5-%E5%A6%82%E4%BD%95%E5%AE%9E%E7%8E%B0%E4%B8%80%E4%B8%AA%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E5%8F%AF%E7%94%A8%E7%9A%84%E2%80%9C%E5%88%92%E8%AF%8D%E9%AB%98%E4%BA%AE%E2%80%9D%EF%BC%9F)

具体使用：

```
// 安装
npm i web-highlighter

// 使用
import Highlighter from 'web-highlighter';
(new Highlighter()).run();
```

高亮区域持久化：

```
import Highlighter from 'web-highlighter';

// 1. 实例化
const highlighter = new Highlighter();

// 2. 从后端（getRemoteData）获取高亮信息，还原至网页
getRemoteData().then(s => highlighter.fromStore(s.startMeta, s.endMeta, s.id, s.text));

// 3. 监听高亮笔记创建事件，并将信息存至后端
highlighter.on(Highlighter.event.CREATE, ({sources}) => save(sources));

// 4. 开启自动划词高亮
highlighter.run();

```

持久化中监听笔记创建事件获取的`sources`是一个数组，数组元素是对象，内容如下图：

```
//包含了 startMeta、endMeta、text和id
[{
    startMeta: {parentTagName: "A", parentIndex: 6, textOffset: 2}
    endMeta: {parentTagName: "H2", parentIndex: 0, textOffset: 2}
    text: "中文↵Ba"
    id: "91031887-238c-4118-a5b7-9def992b9479"
}]
```

![持久化sources内容](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4090db769b7344b5bad98174ac32d6a1~tplv-k3u1fbpfcp-zoom-1.image)

2. 分析 ueditor 与复制
   > 参考该文章[用 js 给选中文字添加样式、标注](https://blog.csdn.net/hefeng6500/article/details/94474303#commentBox)，在上 GitHub 两三下拿到[ueditor](https://github.com/fex-team/ueditor)源码，开始读源码分析代码。除去一些不需要的代码和兼容性处理后，拿到了五个文件：

- browser.js (浏览器版本判断，用于做兼容性处理)
- domUtils.js (dom 操作)
- dtd.js (节点的类型与元素判断)
- Range.js (封装的选中范围对象)
- utils.js (工具类)

> 原作者 [代码 demo 地址](https://gitee.com/vvjiang/notetool), 下面用到部分的与该博客作者略有不同。

主要使用到的代码：

```
import Range from "./utils/Range";
import domUtils from "./utils/domUtils.js";

const getSelectText = () => {
    var getRange = () => {
        var me = window;
        var range = new Range(me.document);

        var sel = window.getSelection();
        if (sel && sel.rangeCount) {
            var firstRange = sel.getRangeAt(0);
            var lastRange = sel.getRangeAt(sel.rangeCount - 1);
            range.setStart(firstRange.startContainer, firstRange.startOffset)
                .setEnd(lastRange.endContainer, lastRange.endOffset);
        }
        return range
    }
    // 如果选中父节点包含 red-color 的class 则移除带 red-color 的 span标签，否则则添加span标签进行选中
    if (domUtils.hasClass(range.startContainer.parentNode, "red-color")) {
        range.removeInlineStyle("span", "red-color");
    } else {
        range.applyInlineStyle("span", {
            class: "red-color"
        });
        range.select();
    }
 };

 <div
    onMouseUp={getSelectText}
    dangerouslySetInnerHTML={{
        __html: `唧唧复唧唧，木兰当户织。不闻机杼声，唯闻女叹息。<br>
    问女何所思，问女何所忆。女亦无所思，女亦无所忆。昨夜见军帖，可汗大点兵，军书十二卷，卷卷有爷名。阿爷无大儿，木兰无长兄，愿为市鞍马，从此替爷征。`
    }}
 >
 </div>
```

> 查看上面 [代码 demo 地址](https://codesandbox.io/embed/jovial-thunder-4zv7n?fontsize=14&hidenavigation=1&theme=dark)

### 三、其他相关的内容

1. css3 中的 `::selection` 选择器
   > 有时候看到有些网站 **选中内容的颜色和背景色** 都不是平时看到的蓝色和白色，此时使用 `::selection` 选择器 可以实现，方便让网站风格统一。

[::selection](https://developer.mozilla.org/zh-CN/docs/Web/CSS/::selection) CSS 伪元素应用于文档中被用户高亮的部分（比如使用鼠标或其他选择设备选中的部分）。

```css
::selection {
  background-color: cyan;
}
```

下图是 MDN 的 demo 动图：
![::selection选择器效果图](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/40015fbf31dd45c082534df05f68fc8d~tplv-k3u1fbpfcp-zoom-1.image)

以上是对选中文本高亮效果总结。

### 参考文献：

1. [【MDN】window.getSelection()](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/getSelection)
2. [【MDN】Selection](https://developer.mozilla.org/zh-CN/docs/Web/API/Selection)
3. [【MDN】ranges](https://developer.mozilla.org/zh-CN/docs/Web/API/Range)
4. [JS Range HTML 文档/文字内容选中、库及应用介绍](https://www.zhangxinxu.com/wordpress/2011/04/js-range-html%E6%96%87%E6%A1%A3%E6%96%87%E5%AD%97%E5%86%85%E5%AE%B9%E9%80%89%E4%B8%AD%E3%80%81%E5%BA%93%E5%8F%8A%E5%BA%94%E7%94%A8%E4%BB%8B%E7%BB%8D/)
5. [web-highlighter](https://alienzhou.github.io/web-highlighter/)
6. [如何用 JS 实现“划词高亮”的在线笔记功能](https://www.alienzhou.com/2019/04/21/web-note-highlight-in-js/#5-%E5%A6%82%E4%BD%95%E5%AE%9E%E7%8E%B0%E4%B8%80%E4%B8%AA%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E5%8F%AF%E7%94%A8%E7%9A%84%E2%80%9C%E5%88%92%E8%AF%8D%E9%AB%98%E4%BA%AE%E2%80%9D%EF%BC%9F)
7. [用 js 给选中文字添加样式、标注](https://blog.csdn.net/hefeng6500/article/details/94474303#commentBox)
8. [JavaScript 标准 Selection 操作](https://www.cnblogs.com/rainman/archive/2011/02/27/1966482.html)
9. [【MDN】::selection](https://developer.mozilla.org/zh-CN/docs/Web/CSS/::selection)
