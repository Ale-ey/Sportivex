// Generated from Routes.g4 by ANTLR 4.13.1
// jshint ignore: start
import antlr4 from 'antlr4';
import RoutesListener from './RoutesListener.js';
import RoutesVisitor from './RoutesVisitor.js';

const serializedATN = [4,1,9,38,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,1,0,4,0,
10,8,0,11,0,12,0,11,1,0,1,0,1,1,1,1,1,1,1,1,4,1,20,8,1,11,1,12,1,21,1,1,
1,1,1,2,1,2,1,2,1,2,1,3,1,3,1,3,5,3,33,8,3,10,3,12,3,36,9,3,1,3,0,0,4,0,
2,4,6,0,0,36,0,9,1,0,0,0,2,15,1,0,0,0,4,25,1,0,0,0,6,29,1,0,0,0,8,10,3,2,
1,0,9,8,1,0,0,0,10,11,1,0,0,0,11,9,1,0,0,0,11,12,1,0,0,0,12,13,1,0,0,0,13,
14,5,0,0,1,14,1,1,0,0,0,15,16,5,1,0,0,16,17,5,6,0,0,17,19,5,2,0,0,18,20,
3,4,2,0,19,18,1,0,0,0,20,21,1,0,0,0,21,19,1,0,0,0,21,22,1,0,0,0,22,23,1,
0,0,0,23,24,5,3,0,0,24,3,1,0,0,0,25,26,5,8,0,0,26,27,5,4,0,0,27,28,3,6,3,
0,28,5,1,0,0,0,29,34,5,7,0,0,30,31,5,5,0,0,31,33,5,7,0,0,32,30,1,0,0,0,33,
36,1,0,0,0,34,32,1,0,0,0,34,35,1,0,0,0,35,7,1,0,0,0,36,34,1,0,0,0,3,11,21,
34];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class RoutesParser extends antlr4.Parser {

    static grammarFileName = "Routes.g4";
    static literalNames = [ null, "'route'", "'{'", "'}'", "':'", "','" ];
    static symbolicNames = [ null, null, null, null, null, null, "ROLE", 
                             "ACTION", "SUBURL", "WS" ];
    static ruleNames = [ "program", "routeDef", "suburlDef", "actionList" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = RoutesParser.ruleNames;
        this.literalNames = RoutesParser.literalNames;
        this.symbolicNames = RoutesParser.symbolicNames;
    }



	program() {
	    let localctx = new ProgramContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, RoutesParser.RULE_program);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 9; 
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        do {
	            this.state = 8;
	            this.routeDef();
	            this.state = 11; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        } while(_la===1);
	        this.state = 13;
	        this.match(RoutesParser.EOF);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	routeDef() {
	    let localctx = new RouteDefContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, RoutesParser.RULE_routeDef);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 15;
	        this.match(RoutesParser.T__0);
	        this.state = 16;
	        this.match(RoutesParser.ROLE);
	        this.state = 17;
	        this.match(RoutesParser.T__1);
	        this.state = 19; 
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        do {
	            this.state = 18;
	            this.suburlDef();
	            this.state = 21; 
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        } while(_la===8);
	        this.state = 23;
	        this.match(RoutesParser.T__2);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	suburlDef() {
	    let localctx = new SuburlDefContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, RoutesParser.RULE_suburlDef);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 25;
	        this.match(RoutesParser.SUBURL);
	        this.state = 26;
	        this.match(RoutesParser.T__3);
	        this.state = 27;
	        this.actionList();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	actionList() {
	    let localctx = new ActionListContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, RoutesParser.RULE_actionList);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 29;
	        this.match(RoutesParser.ACTION);
	        this.state = 34;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===5) {
	            this.state = 30;
	            this.match(RoutesParser.T__4);
	            this.state = 31;
	            this.match(RoutesParser.ACTION);
	            this.state = 36;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}


}

RoutesParser.EOF = antlr4.Token.EOF;
RoutesParser.T__0 = 1;
RoutesParser.T__1 = 2;
RoutesParser.T__2 = 3;
RoutesParser.T__3 = 4;
RoutesParser.T__4 = 5;
RoutesParser.ROLE = 6;
RoutesParser.ACTION = 7;
RoutesParser.SUBURL = 8;
RoutesParser.WS = 9;

RoutesParser.RULE_program = 0;
RoutesParser.RULE_routeDef = 1;
RoutesParser.RULE_suburlDef = 2;
RoutesParser.RULE_actionList = 3;

class ProgramContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = RoutesParser.RULE_program;
    }

	EOF() {
	    return this.getToken(RoutesParser.EOF, 0);
	};

	routeDef = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(RouteDefContext);
	    } else {
	        return this.getTypedRuleContext(RouteDefContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof RoutesListener ) {
	        listener.enterProgram(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof RoutesListener ) {
	        listener.exitProgram(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof RoutesVisitor ) {
	        return visitor.visitProgram(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class RouteDefContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = RoutesParser.RULE_routeDef;
    }

	ROLE() {
	    return this.getToken(RoutesParser.ROLE, 0);
	};

	suburlDef = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(SuburlDefContext);
	    } else {
	        return this.getTypedRuleContext(SuburlDefContext,i);
	    }
	};

	enterRule(listener) {
	    if(listener instanceof RoutesListener ) {
	        listener.enterRouteDef(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof RoutesListener ) {
	        listener.exitRouteDef(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof RoutesVisitor ) {
	        return visitor.visitRouteDef(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class SuburlDefContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = RoutesParser.RULE_suburlDef;
    }

	SUBURL() {
	    return this.getToken(RoutesParser.SUBURL, 0);
	};

	actionList() {
	    return this.getTypedRuleContext(ActionListContext,0);
	};

	enterRule(listener) {
	    if(listener instanceof RoutesListener ) {
	        listener.enterSuburlDef(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof RoutesListener ) {
	        listener.exitSuburlDef(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof RoutesVisitor ) {
	        return visitor.visitSuburlDef(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class ActionListContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = RoutesParser.RULE_actionList;
    }

	ACTION = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(RoutesParser.ACTION);
	    } else {
	        return this.getToken(RoutesParser.ACTION, i);
	    }
	};


	enterRule(listener) {
	    if(listener instanceof RoutesListener ) {
	        listener.enterActionList(this);
		}
	}

	exitRule(listener) {
	    if(listener instanceof RoutesListener ) {
	        listener.exitActionList(this);
		}
	}

	accept(visitor) {
	    if ( visitor instanceof RoutesVisitor ) {
	        return visitor.visitActionList(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}




RoutesParser.ProgramContext = ProgramContext; 
RoutesParser.RouteDefContext = RouteDefContext; 
RoutesParser.SuburlDefContext = SuburlDefContext; 
RoutesParser.ActionListContext = ActionListContext; 
