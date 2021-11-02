import { scrap } from 'tscm-examples';

(async () => {
  let { Node, Leaf } = await scrap!!(`
  data Node { left: Node | Leaf, right: Node | Leaf }
  data Leaf { data: any }
  `);

  // hover this for type
  let tree = Node(Node(Leaf(1), Leaf(10)), Leaf(6));
  console.log(tree.left);

  // These will error
  // @ts-expect-error
  Leaf('foo', 'bar');
  // @ts-expect-error
  Node('bar');
})();
