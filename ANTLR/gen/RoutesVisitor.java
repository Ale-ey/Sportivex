// Generated from C:/Programming/DSLs/ANTLR/Routes.g4 by ANTLR 4.13.2
import org.antlr.v4.runtime.tree.ParseTreeVisitor;

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by {@link RoutesParser}.
 *
 * @param <T> The return type of the visit operation. Use {@link Void} for
 * operations with no return type.
 */
public interface RoutesVisitor<T> extends ParseTreeVisitor<T> {
	/**
	 * Visit a parse tree produced by {@link RoutesParser#program}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitProgram(RoutesParser.ProgramContext ctx);
	/**
	 * Visit a parse tree produced by {@link RoutesParser#routeDef}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitRouteDef(RoutesParser.RouteDefContext ctx);
	/**
	 * Visit a parse tree produced by {@link RoutesParser#suburlDef}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitSuburlDef(RoutesParser.SuburlDefContext ctx);
	/**
	 * Visit a parse tree produced by {@link RoutesParser#actionList}.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	T visitActionList(RoutesParser.ActionListContext ctx);
}