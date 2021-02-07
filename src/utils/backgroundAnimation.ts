(() => {
  const requestAnimationFrame = (callback: () => {}) => window.setTimeout(() => {
    callback();
  }, 1000 / 60);

  window.requestAnimationFrame = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || requestAnimationFrame;

  const cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };

  window.cancelAnimationFrame = window.cancelAnimationFrame
    || window.webkitRequestAnimationFrame
    || cancelAnimationFrame;
})();

interface Item {
  x: number;
  y: number;
  text: string;
}

export default (words = 'Vechain') => {
  const el = document.querySelector('.zkp-home__background');
  if (el && el.parentElement) {
    el.parentElement.removeChild(el);
  }

  const { innerWidth, innerHeight } = window;
  const canvas = document.createElement('canvas');
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
  document.body.appendChild(canvas);
  canvas.className = 'zkp-home__background';
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  const fontSize = 12;
  const columns = innerWidth / 36;
  const wordsArr = words.split('');
  const data: Item[][] = [];

  for (let i = 0; i < columns; i += 1) {
    const column: Item[] = [];
    const x = i * 36;
    for (let j = 0; j < wordsArr.length; j += 1) {
      if (j === 0) {
        column.push({
          x,
          y: parseInt(`${Math.random() * innerHeight}`, 10),
          text: wordsArr[j],
        });
      } else {
        column.push({
          x,
          y: column[j - 1].y + fontSize,
          text: wordsArr[j],
        });
      }
    }
    data.push(column);
  }

  const createNewItemData = (item: Item[]) => {
    const startY = parseInt(`${Math.random() * innerHeight}`, 10);
    const column: Item[] = item.map((childItem, index) => ({
      x: childItem.x,
      y: index * fontSize - startY,
      text: childItem.text,
    }));
    data.push(column);
  };

  const draw = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    data.forEach((item, index) => {
      item.forEach((childItem, childIndex) => {
        ctx.fillStyle = 'rgba(255 , 255, 255, 0.15)';
        ctx.font = `${fontSize}px Courier New`;

        if (
          childItem.y > innerHeight * 1.25
          && childIndex >= item.length - 1
        ) {
          createNewItemData(item);
          data.splice(index, 1);
        } else {
          Object.assign(childItem, {
            y: childItem.y + fontSize,
          });
          ctx.fillText(childItem.text, childItem.x, childItem.y);
        }
      });
    });
    window.requestAnimationFrame(draw);
  };
  draw();
};
