// Generated from C:/Programming/DSLs/ANTLR/Routes.g4 by ANTLR 4.13.2
import org.antlr.v4.runtime.tree.ParseTreeListener;

/**
 * This interface defines a complete listener for a parse tree produced by
 * {@link RoutesParser}.
 */
public interface RoutesListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by {@link RoutesParser#program}.
	 * @param ctx the parse tree
	 */
	void enterProgram(RoutesParser.ProgramContext ctx);
	/**
	 * Exit a parse tree produced by {@link RoutesParser#program}.
	 * @param ctx the parse tree
	 */
	void exitProgram(RoutesParser.ProgramContext ctx);
	/**
	 * Enter a parse tree produced by {@link RoutesParser#routeDef}.
	 * @param ctx the parse tree
	 */
	void enterRouteDef(RoutesParser.RouteDefContext ctx);
	/**
	 * Exit a parse tree produced by {@link RoutesParser#routeDef}.
	 * @param ctx the parse tree
	 */
	void exitRouteDef(RoutesParser.RouteDefContext ctx);
	/**
	 * Enter a parse tree produced by {@link RoutesParser#suburlDef}.
	 * @param ctx the parse tree
	 */
	void enterSuburlDef(RoutesParser.SuburlDefContext ctx);
	/**
	 * Exit a parse tree produced by {@link RoutesParser#suburlDef}.
	 * @param ctx the parse tree
	 */
	void exitSuburlDef(RoutesParser.SuburlDefContext ctx);
	/**
	 * Enter a parse tree produced by {@link RoutesParser#actionList}.
	 * @param ctx the parse tree
	 */
	void enterActionList(RoutesParser.ActionListContext ctx);
	/**
	 * Exit a parse tree produced by {@link RoutesParser#actionList}.
	 * @param ctx the parse tree
	 */
	void exitActionList(RoutesParser.ActionListContext ctx);
}