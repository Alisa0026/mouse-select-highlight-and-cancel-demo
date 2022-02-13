import React from "react";
import "./styles.css";
import Range from "./utils/Range";
import domUtils from "./utils/domUtils.js";

const App = () => {
  const getSelectText = () => {
    let getRange = () => {
      var me = window;
      var range = new Range(me.document);

      var sel = window.getSelection();
      if (sel && sel.rangeCount) {
        var firstRange = sel.getRangeAt(0);
        var lastRange = sel.getRangeAt(sel.rangeCount - 1);

        range.setStart(firstRange.startContainer, firstRange.startOffset);
        range.setEnd(lastRange.endContainer, lastRange.endOffset);
      }
      return range;
    };

    let range = getRange();
    console.log(range, range.startContainer.parentNode);
    // console.log(domUtils.hasClass(range.startContainer.parentNode, 'color-red'));
    // 如果选中父节点包含 color-red 的class 则移除带 color-red 的 i标签，否则则添加i标签进行选中
    if (domUtils.hasClass(range.startContainer.parentNode, "color-red")) {
      range.removeInlineStyle("i", "color-red");
    } else {
      range.applyInlineStyle("i", {
        class: "color-red"
      });
      range.select();
    }
  };

  return (
    <div className="App">
      <h4>鼠标滑动选中高亮，再次滑动选中的取消高亮</h4>
      <div
        onMouseUp={getSelectText}
        dangerouslySetInnerHTML={{
          __html: `唧唧复唧唧，木兰当户织。不闻机杼声，唯闻女叹息。
          <br>
          问女何所思，问女何所忆。女亦无所思，女亦无所忆。昨夜见军帖，可汗大点兵，军书十二卷，卷卷有爷名。阿爷无大儿，木兰无长兄，愿为市鞍马，从此替爷征。
          <br>
          东市买骏马，西市买鞍鞯，南市买辔头，北市买长鞭。旦辞爷娘去，暮宿黄河边，不闻爷娘唤女声，但闻黄河流水鸣溅溅。旦辞黄河去，暮至黑山头，不闻爷娘唤女声，但闻燕山胡骑鸣啾啾。
          <br>
          万里赴戎机，关山度若飞。朔气传金柝，寒光照铁衣。将军百战死，壮士十年归。
          <br>
          归来见天子，天子坐明堂。策勋十二转，赏赐百千强。可汗问所欲，木兰不用尚书郎，愿驰千里足，送儿还故乡。
          <br>
          爷娘闻女来，出郭相扶将；阿姊闻妹来，当户理红妆；小弟闻姊来，磨刀霍霍向猪羊。开我东阁门，坐我西阁床，脱我战时袍，著我旧时裳。当窗理云鬓，对镜帖花黄。出门看火伴，火伴皆惊忙：同行十二年，不知木兰是女郎。
          <br>
          雄兔脚扑朔，雌兔眼迷离；双兔傍地走，安能辨我是雄雌？`
        }}
      />
      {/* 唧唧复唧唧，木兰当户织。不闻机杼声，唯闻女叹息。
      <br />
      问女何所思，问女何所忆。女亦无所思，女亦无所忆。昨夜见军帖，可汗大点兵，军书十二卷，卷卷有爷名。阿爷无大儿，木兰无长兄，愿为市鞍马，从此替爷征。 */}
    </div>
  );
};
export default App;
