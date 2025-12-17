import RoutesVisitor from './RoutesVisitor.js';

export default class RouteCompiler extends RoutesVisitor {

  visitRouteDef(ctx) {
    const role = ctx.ROLE().getText();
    console.log(`ROLE: ${role}`);
    return this.visitChildren(ctx);
  }

  visitSuburlDef(ctx) {
    const suburl = ctx.SUBURL().getText();
    const actions = ctx.actionList()
      .ACTION()
      .map(a => a.getText());

    console.log(`  ${suburl} -> ${actions.join(', ')}`);
  }
}
