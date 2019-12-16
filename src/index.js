/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
class AJS {
	constructor(value) {
		this.value = value
	}

	run(x) {
		return this.value(x)
	}

	static get emptyValue() {
		return 0
	}

	static get zeroValue() {
		return 0
	}

	isEmpty() {
		return this.value === AJS.emptyValue
	}

	isZero() {
		return this.value === AJS.zeroValue
	}

	static identity(x) {
		return x
	}

	// Setoid

	// a.equals(a) === true (reflexivity)
	// a.equals(b) === b.equals(a) (symmetry)
	// If a.equals(b) and b.equals(c), then a.equals(c) (transitivity)

	equals(setoid) {
		// Setoid a => a ~> a -> Boolean
		return this.value === setoid.value
	}

	// Ord

	// a.lte(b) or b.lte(a) (totality)
	// If a.lte(b) and b.lte(a), then a.equals(b) (antisymmetry)
	// If a.lte(b) and b.lte(c), then a.lte(c) (transitivity)

	lte(ord) {
		// Ord a => a ~> a -> Boolean
		return this.value <= ord.value
	}

	// Semigroupoid

	// a.compose(b).compose(c) === a.compose(b.compose(c)) (associativity)

	compose(semigroupoid) {
		// Semigroupoid c => c (i->j) ~> c (j->k) -> c (i->k)
		return AJS.of(x => semigroupoid.value(this.value(x)))
	}

	// Category

	// a.compose(C.id()) is equivalent to a (right identity)
	// C.id().compose(a) is equivalent to a (left identity)

	static id() {
		// Category c => () -> c (a->a)
		return AJS.of(AJS.identity)
	}

	// Semigroup

	// a.concat(b).concat(c) is equivalent to a.concat(b.concat(c)) (associativity)

	concat(semigroup) {
		// Semigroup a => a ~> a -> a
		return AJS.of(this.value + semigroup.value)
	}

	// Monoid

	// m.concat(M.empty()) is equivalent to m (right identity)
	// M.empty().concat(m) is equivalent to m (left identity)

	static empty() {
		// Monoid m => () -> m
		return AJS.of(AJS.emptyValue)
	}

	// Group

	// g.concat(g.invert()) is equivalent to g.constructor.empty() (right inverse)
	// g.invert().concat(g) is equivalent to g.constructor.empty() (left inverse)
	invert() {
		// Group g => g ~> () -> g
		return AJS.of(-this.value)
	}

	// Filterable

	// v.filter(x => p(x) && q(x)) is equivalent to v.filter(p).filter(q) (distributivity)
	// v.filter(x => true) is equivalent to v (identity)
	// v.filter(x => false) is equivalent to w.filter(x => false) if v and w are values of the same Filterable (annihilation)

	filter(f) {
		// Filterable f => f a ~> (a -> Boolean) -> f a
		return f(this.value) ? AJS.of(this.value) : AJS.empty()
	}

	// Functor

	// u.map(a => a) is equivalent to u (identity)
	// u.map(x => f(g(x))) is equivalent to u.map(g).map(f) (composition)

	map(f) {
		// Functor f => f a ~> (a -> b) -> f b
		return this.isZero() ? AJS.zero() : AJS.of(f(this.value))
	}

	// Contravariant

	// u.contramap(a => a) is equivalent to u (identity)
	// u.contramap(x => f(g(x))) is equivalent to u.contramap(f).contramap(g) (composition)

	contramap(f) {
		// Contravariant f => f a ~> (b -> a) -> f b
		return AJS.of(x => this.value(f(x)))
	}


	// Apply

	// v.ap(u.ap(a.map(f => g => x => f(g(x))))) is equivalent to v.ap(u).ap(a) (composition)

	ap(apply) {
		// Apply f => f a ~> f (a -> b) -> f b
		return typeof apply.value === 'function'
			? (apply.isZero()
				? AJS.zero()
				: AJS.of(apply.value(this.value)))
			: apply.isZero()
				? AJS.zero()
				: AJS.of(this.value(apply.value))
	}

	// Applicative

	// v.ap(A.of(x => x)) is equivalent to v (identity)
	// A.of(x).ap(A.of(f)) is equivalent to A.of(f(x)) (homomorphism)
	// A.of(y).ap(u) is equivalent to u.ap(A.of(f => f(y))) (interchange)

	static of(value) {
		// Applicative f => a -> f a
		return new AJS(value)
	}

	// Alt

	// a.alt(b).alt(c) is equivalent to a.alt(b.alt(c)) (associativity)
	// a.alt(b).map(f) is equivalent to a.map(f).alt(b.map(f)) (distributivity)

	alt(alt) {
		// Alt f => f a ~> f a -> f a
		return AJS.of(this.isZero() ? alt.value : this.value)
	}

	// Plus

	// x.alt(A.zero()) is equivalent to x (right identity)
	// A.zero().alt(x) is equivalent to x (left identity)
	// A.zero().map(f) is equivalent to A.zero() (annihilation)

	static zero() {
		// Plus f => () -> f a
		return AJS.of(AJS.zeroValue)
	}

	// Alternative

	// x.ap(f.alt(g)) is equivalent to x.ap(f).alt(x.ap(g)) (distributivity)
	// x.ap(A.zero()) is equivalent to A.zero() (annihilation)

	// Foldable

	// u.reduce is equivalent to u.reduce((acc, x) => acc.concat([x]), []).reduce

	reduce(f, init) {
		// Foldable f => f a ~> ((b, a) -> b, b) -> b
		return f(init, this.value)
	}

	// Traversable

	// t(u.traverse(F, x => x)) is equivalent to u.traverse(G, t) for any t such that t(a).map(f) is equivalent to t(a.map(f)) (naturality)
	// u.traverse(F, F.of) is equivalent to F.of(u) for any Applicative F (identity)
	// u.traverse(Compose, x => new Compose(x)) is equivalent to new Compose(u.traverse(F, x => x).map(x => x.traverse(G, x => x))) for Compose defined below and any Applicatives F and G (composition)

	traverse(T, f) {
		// Applicative u, Traversable t => t a ~> (TypeRep u, a -> u b) -> u (t b)
		return T.of(AJS.of(f(this.value).value))
	}

	// Chain

	// m.chain(f).chain(g) is equivalent to m.chain(x => f(x).chain(g)) (associativity)

	chain(f) {
		// Chain m => m a ~> (a -> m b) -> m b
		return AJS.of(f(this.value).value)
	}

	// ChainRec

	// M.chainRec((next, done, v) => p(v) ? d(v).map(done) : n(v).map(next), i) is equivalent to (function step(v) { return p(v) ? d(v) : n(v).chain(step); }(i)) (equivalence)
	// Stack usage of M.chainRec(f, i) must be at most a constant multiple of the stack usage of f itself.

	chainRec() {
		// ChainRec m => ((a -> c, b -> c, a) -> m c, a) -> m b
		// return AJS.of()
		return this
	}

	// Monad

	// M.of(a).chain(f) is equivalent to f(a) (left identity)
	// m.chain(M.of) is equivalent to m (right identity)

	// Extend

	// w.extend(g).extend(f) is equivalent to w.extend(_w => f(_w.extend(g)))

	extend(f) {
		// Extend w => w a ~> (w a -> b) -> w b
		return AJS.of(f(this))
	}

	// Comonad

	// w.extend(_w => _w.extract()) is equivalent to w (left identity)
	// w.extend(f).extract() is equivalent to f(w) (right identity)

	extract() {
		// Comonad w => w a ~> () -> a
		return this.value
	}
}

class AJS_BI {
	constructor(first, second) {
		this.first = first
		this.second = second
	}

	// Bifunctor

	// p.bimap(a => a, b => b) is equivalent to p (identity)
	// p.bimap(a => f(g(a)), b => h(i(b)) is equivalent to p.bimap(g, i).bimap(f, h) (composition)

	bimap(f, g) {
		// Bifunctor f => f a c ~> (a -> b, c -> d) -> f b d
		return AJS_BI.of(f(this.first), g(this.second))
	}

	// Profunctor

	// p.promap(a => a, b => b) is equivalent to p (identity)
	// p.promap(a => f(g(a)), b => h(i(b))) is equivalent to p.promap(f, i).promap(g, h) (composition)

	promap(f, g) {
		// Profunctor p => p b c ~> (a -> b, c -> d) -> p a d
		return AJS_BI.of(x => this.first(f(x)), g(this.second))
	}

	// Applicative

	// v.ap(A.of(x => x)) is equivalent to v (identity)
	// A.of(x).ap(A.of(f)) is equivalent to A.of(f(x)) (homomorphism)
	// A.of(y).ap(u) is equivalent to u.ap(A.of(f => f(y))) (interchange)

	static of(first, second) {
		// Applicative f => (a, b) -> f (a, b)
		return new AJS_BI(first, second)
	}

	prorun(x) {
		this.first(x)
		return this
	}
}

const { log } = console

const ajsEmptyA = AJS.empty()
const ajsZeroA = AJS.zero()
const ajs0A = AJS.of(0)
const ajs1A = AJS.of(1)
const ajs1B = AJS.of(1)
const ajs2A = AJS.of(2)
const ajs1C = AJS.of(1)
const ajs3A = AJS.of(3)

const ajsInc = AJS.of(x => x + 1)
const ajsDouble = AJS.of(x => x * 2)
const ajsDec = AJS.of(x => x - 1)

const p = x => x > 1
const q = x => x < 3

const f = x => x + 1
const g = x => x * 2

const ajsId = AJS.of(AJS.identity)

const add = (x, y) => x + y

const ajsTraversable = AJS.of(ajs1A)
const fTraversable = t => AJS.of(t.value)

const fChain = x => AJS.of(x + 1)
const gChain = x => AJS.of(x * 2)

const fExtend = x => x.value + 1
const gExtend = x => x.value * 2

const ajsBimapA = AJS_BI.of(1, 2)
const h = x => x / 2
const i = x => x - 1

const ajsPromapA = AJS_BI.of(() => 1, 2)

// log(ajs1A.equals(ajs1A) === true)
// log(ajs1A.equals(ajs1B) === ajs1B.equals(ajs1A))
// log(ajs1A.equals(ajs2A) === ajs2A.equals(ajs1A))
// log(ajs1A.equals(ajs1B) && ajs1B.equals(ajs1C) && ajs1A.equals(ajs1C))

// log(ajs1A.lte(ajs2A) || ajs2A.lte(ajs1A))
// log(ajs1A.lte(ajs1B) && ajs1B.lte(ajs1A) && ajs1A.equals(ajs1B))
// log(ajs1A.lte(ajs2A) && ajs2A.lte(ajs3A) && ajs1A.lte(ajs3A))

// log(ajsInc.compose(AJS.id()).value(1) === ajsInc.value(1))
// log(AJS.id().compose(ajsInc).value(1) === ajsInc.value(1))

// log(ajs1A.concat(ajs2A).concat(ajs3A).equals(ajs1A.concat(ajs2A.concat(ajs3A))))

// log(ajs1A.concat(ajsEmptyA).equals(ajs1A))
// log(ajsEmptyA.concat(ajs1A).equals(ajs1A))

// log(ajs1A.concat(ajs1A.invert()).equals(ajsEmptyA))
// log(ajs1A.invert().concat(ajs1A).equals(ajsEmptyA))


// log(ajs2A.filter(x => p(x) && q(x)).equals(ajs2A.filter(p).filter(q)))
// log(ajs1A.filter(() => true).equals(ajs1A))
// log(ajs1A.filter(() => false).equals(ajs1B.filter(() => false)))


// log(ajs1A.map(AJS.identity).equals(ajs1A))
// log(ajs1A.map(x => f(g(x))).equals(ajs1A.map(g).map(f)))

// log(ajsId.contramap(AJS.identity).run(1) === ajsId.run(1))
// log(ajsId.contramap(x => f(g(x))).run(1) === ajsId.contramap(f).contramap(g).run(1))

// log(ajs1A.ap(AJS.of(x => x)).equals(ajs1A))
// log(AJS.of(1).ap(AJS.of(f)).equals(AJS.of(f(1))))
// log(AJS.of(1).ap(ajsInc).equals(ajsInc.ap(AJS.of(f => f(1)))))

// log(ajsZeroA.alt(ajs0A).alt(ajs1A).equals(ajsZeroA.alt(ajs0A.alt(ajs1A))))
// log(ajsZeroA.alt(ajs0A).map(f).equals(ajsZeroA.map(f).alt(ajs0A.map(f))))

// log(ajs1A.alt(AJS.zero()).equals(ajs1A))
// log(AJS.zero().alt(ajs1A).equals(ajs1A))
// log(AJS.zero().map(f).equals(AJS.zero()))

// log(ajsInc.ap(ajsZeroA.alt(ajs1A)).equals(ajsInc.ap(ajsZeroA).alt(ajsInc.ap(ajs1A))))
// log(ajsInc.ap(AJS.zero()).equals(AJS.zero()))

// log(ajs1A.reduce(add, 1) === ajs1A.reduce((acc, x) => acc.concat([x]), []).reduce(add, 1))

// log(
// 	fTraversable(ajsTraversable.traverse(AJS, AJS.identity)).value
// 		.equals(ajsTraversable.traverse(AJS, fTraversable).value)
// )
// log(ajs1A.traverse(AJS, AJS.of).value.equals(AJS.of(ajs1A).value))

// log(
// 	ajs1A.chain(fChain).chain(gChain).equals(
// 		ajs1A.chain(x => fChain(x).chain(gChain))
// 	)
// )

// log(AJS.of(1).chain(fChain).equals(fChain(1)))
// log(ajs1A.chain(AJS.of).equals(ajs1A))

// log(ajs1A.extend(gExtend).extend(fExtend).equals(ajs1A.extend(_w => fExtend(_w.extend(gExtend)))))

// log(ajs1A.extend(_w => _w.extract()).equals(ajs1A))
// log(ajs1A.extend(fExtend).extract() === fExtend(ajs1A))

// log(ajsBimapA.bimap(AJS.identity, AJS.identity).first === ajsBimapA.first
// 	&& ajsBimapA.bimap(AJS.identity, AJS.identity).second === ajsBimapA.second)
// log(ajsBimapA.bimap(x => f(g(x)), x => h(i(x))).first === ajsBimapA.bimap(g, i).bimap(f, h).first
// 	&& ajsBimapA.bimap(x => f(g(x)), x => h(i(x))).second === ajsBimapA.bimap(g, i).bimap(f, h).second)

// log(ajsPromapA.promap(AJS.identity, AJS.identity).prorun().first(1) === ajsPromapA.prorun().first(1))
// log(ajsPromapA.promap(a => f(g(a)), b => h(i(b))).prorun().first(1) === ajsPromapA.promap(f, i).promap(g, h).prorun().first(1))
