// Generated from C:/Programming/DSLs/ANTLR/Routes.g4 by ANTLR 4.13.2
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.misc.*;
import org.antlr.v4.runtime.tree.*;
import java.util.List;
import java.util.Iterator;
import java.util.ArrayList;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast", "CheckReturnValue", "this-escape"})
public class RoutesParser extends Parser {
	static { RuntimeMetaData.checkVersion("4.13.2", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		T__0=1, T__1=2, T__2=3, T__3=4, T__4=5, ROLE=6, ACTION=7, SUBURL=8, WS=9;
	public static final int
		RULE_program = 0, RULE_routeDef = 1, RULE_suburlDef = 2, RULE_actionList = 3;
	private static String[] makeRuleNames() {
		return new String[] {
			"program", "routeDef", "suburlDef", "actionList"
		};
	}
	public static final String[] ruleNames = makeRuleNames();

	private static String[] makeLiteralNames() {
		return new String[] {
			null, "'route'", "'{'", "'}'", "':'", "','"
		};
	}
	private static final String[] _LITERAL_NAMES = makeLiteralNames();
	private static String[] makeSymbolicNames() {
		return new String[] {
			null, null, null, null, null, null, "ROLE", "ACTION", "SUBURL", "WS"
		};
	}
	private static final String[] _SYMBOLIC_NAMES = makeSymbolicNames();
	public static final Vocabulary VOCABULARY = new VocabularyImpl(_LITERAL_NAMES, _SYMBOLIC_NAMES);

	/**
	 * @deprecated Use {@link #VOCABULARY} instead.
	 */
	@Deprecated
	public static final String[] tokenNames;
	static {
		tokenNames = new String[_SYMBOLIC_NAMES.length];
		for (int i = 0; i < tokenNames.length; i++) {
			tokenNames[i] = VOCABULARY.getLiteralName(i);
			if (tokenNames[i] == null) {
				tokenNames[i] = VOCABULARY.getSymbolicName(i);
			}

			if (tokenNames[i] == null) {
				tokenNames[i] = "<INVALID>";
			}
		}
	}

	@Override
	@Deprecated
	public String[] getTokenNames() {
		return tokenNames;
	}

	@Override

	public Vocabulary getVocabulary() {
		return VOCABULARY;
	}

	@Override
	public String getGrammarFileName() { return "Routes.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public ATN getATN() { return _ATN; }

	public RoutesParser(TokenStream input) {
		super(input);
		_interp = new ParserATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ProgramContext extends ParserRuleContext {
		public TerminalNode EOF() { return getToken(RoutesParser.EOF, 0); }
		public List<RouteDefContext> routeDef() {
			return getRuleContexts(RouteDefContext.class);
		}
		public RouteDefContext routeDef(int i) {
			return getRuleContext(RouteDefContext.class,i);
		}
		public ProgramContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_program; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof RoutesListener ) ((RoutesListener)listener).enterProgram(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof RoutesListener ) ((RoutesListener)listener).exitProgram(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof RoutesVisitor ) return ((RoutesVisitor<? extends T>)visitor).visitProgram(this);
			else return visitor.visitChildren(this);
		}
	}

	public final ProgramContext program() throws RecognitionException {
		ProgramContext _localctx = new ProgramContext(_ctx, getState());
		enterRule(_localctx, 0, RULE_program);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(9); 
			_errHandler.sync(this);
			_la = _input.LA(1);
			do {
				{
				{
				setState(8);
				routeDef();
				}
				}
				setState(11); 
				_errHandler.sync(this);
				_la = _input.LA(1);
			} while ( _la==T__0 );
			setState(13);
			match(EOF);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class RouteDefContext extends ParserRuleContext {
		public TerminalNode ROLE() { return getToken(RoutesParser.ROLE, 0); }
		public List<SuburlDefContext> suburlDef() {
			return getRuleContexts(SuburlDefContext.class);
		}
		public SuburlDefContext suburlDef(int i) {
			return getRuleContext(SuburlDefContext.class,i);
		}
		public RouteDefContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_routeDef; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof RoutesListener ) ((RoutesListener)listener).enterRouteDef(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof RoutesListener ) ((RoutesListener)listener).exitRouteDef(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof RoutesVisitor ) return ((RoutesVisitor<? extends T>)visitor).visitRouteDef(this);
			else return visitor.visitChildren(this);
		}
	}

	public final RouteDefContext routeDef() throws RecognitionException {
		RouteDefContext _localctx = new RouteDefContext(_ctx, getState());
		enterRule(_localctx, 2, RULE_routeDef);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(15);
			match(T__0);
			setState(16);
			match(ROLE);
			setState(17);
			match(T__1);
			setState(19); 
			_errHandler.sync(this);
			_la = _input.LA(1);
			do {
				{
				{
				setState(18);
				suburlDef();
				}
				}
				setState(21); 
				_errHandler.sync(this);
				_la = _input.LA(1);
			} while ( _la==SUBURL );
			setState(23);
			match(T__2);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class SuburlDefContext extends ParserRuleContext {
		public TerminalNode SUBURL() { return getToken(RoutesParser.SUBURL, 0); }
		public ActionListContext actionList() {
			return getRuleContext(ActionListContext.class,0);
		}
		public SuburlDefContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_suburlDef; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof RoutesListener ) ((RoutesListener)listener).enterSuburlDef(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof RoutesListener ) ((RoutesListener)listener).exitSuburlDef(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof RoutesVisitor ) return ((RoutesVisitor<? extends T>)visitor).visitSuburlDef(this);
			else return visitor.visitChildren(this);
		}
	}

	public final SuburlDefContext suburlDef() throws RecognitionException {
		SuburlDefContext _localctx = new SuburlDefContext(_ctx, getState());
		enterRule(_localctx, 4, RULE_suburlDef);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(25);
			match(SUBURL);
			setState(26);
			match(T__3);
			setState(27);
			actionList();
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ActionListContext extends ParserRuleContext {
		public List<TerminalNode> ACTION() { return getTokens(RoutesParser.ACTION); }
		public TerminalNode ACTION(int i) {
			return getToken(RoutesParser.ACTION, i);
		}
		public ActionListContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_actionList; }
		@Override
		public void enterRule(ParseTreeListener listener) {
			if ( listener instanceof RoutesListener ) ((RoutesListener)listener).enterActionList(this);
		}
		@Override
		public void exitRule(ParseTreeListener listener) {
			if ( listener instanceof RoutesListener ) ((RoutesListener)listener).exitActionList(this);
		}
		@Override
		public <T> T accept(ParseTreeVisitor<? extends T> visitor) {
			if ( visitor instanceof RoutesVisitor ) return ((RoutesVisitor<? extends T>)visitor).visitActionList(this);
			else return visitor.visitChildren(this);
		}
	}

	public final ActionListContext actionList() throws RecognitionException {
		ActionListContext _localctx = new ActionListContext(_ctx, getState());
		enterRule(_localctx, 6, RULE_actionList);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(29);
			match(ACTION);
			setState(34);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==T__4) {
				{
				{
				setState(30);
				match(T__4);
				setState(31);
				match(ACTION);
				}
				}
				setState(36);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static final String _serializedATN =
		"\u0004\u0001\t&\u0002\u0000\u0007\u0000\u0002\u0001\u0007\u0001\u0002"+
		"\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0001\u0000\u0004\u0000\n\b"+
		"\u0000\u000b\u0000\f\u0000\u000b\u0001\u0000\u0001\u0000\u0001\u0001\u0001"+
		"\u0001\u0001\u0001\u0001\u0001\u0004\u0001\u0014\b\u0001\u000b\u0001\f"+
		"\u0001\u0015\u0001\u0001\u0001\u0001\u0001\u0002\u0001\u0002\u0001\u0002"+
		"\u0001\u0002\u0001\u0003\u0001\u0003\u0001\u0003\u0005\u0003!\b\u0003"+
		"\n\u0003\f\u0003$\t\u0003\u0001\u0003\u0000\u0000\u0004\u0000\u0002\u0004"+
		"\u0006\u0000\u0000$\u0000\t\u0001\u0000\u0000\u0000\u0002\u000f\u0001"+
		"\u0000\u0000\u0000\u0004\u0019\u0001\u0000\u0000\u0000\u0006\u001d\u0001"+
		"\u0000\u0000\u0000\b\n\u0003\u0002\u0001\u0000\t\b\u0001\u0000\u0000\u0000"+
		"\n\u000b\u0001\u0000\u0000\u0000\u000b\t\u0001\u0000\u0000\u0000\u000b"+
		"\f\u0001\u0000\u0000\u0000\f\r\u0001\u0000\u0000\u0000\r\u000e\u0005\u0000"+
		"\u0000\u0001\u000e\u0001\u0001\u0000\u0000\u0000\u000f\u0010\u0005\u0001"+
		"\u0000\u0000\u0010\u0011\u0005\u0006\u0000\u0000\u0011\u0013\u0005\u0002"+
		"\u0000\u0000\u0012\u0014\u0003\u0004\u0002\u0000\u0013\u0012\u0001\u0000"+
		"\u0000\u0000\u0014\u0015\u0001\u0000\u0000\u0000\u0015\u0013\u0001\u0000"+
		"\u0000\u0000\u0015\u0016\u0001\u0000\u0000\u0000\u0016\u0017\u0001\u0000"+
		"\u0000\u0000\u0017\u0018\u0005\u0003\u0000\u0000\u0018\u0003\u0001\u0000"+
		"\u0000\u0000\u0019\u001a\u0005\b\u0000\u0000\u001a\u001b\u0005\u0004\u0000"+
		"\u0000\u001b\u001c\u0003\u0006\u0003\u0000\u001c\u0005\u0001\u0000\u0000"+
		"\u0000\u001d\"\u0005\u0007\u0000\u0000\u001e\u001f\u0005\u0005\u0000\u0000"+
		"\u001f!\u0005\u0007\u0000\u0000 \u001e\u0001\u0000\u0000\u0000!$\u0001"+
		"\u0000\u0000\u0000\" \u0001\u0000\u0000\u0000\"#\u0001\u0000\u0000\u0000"+
		"#\u0007\u0001\u0000\u0000\u0000$\"\u0001\u0000\u0000\u0000\u0003\u000b"+
		"\u0015\"";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}