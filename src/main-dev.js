import AuraCalendar from '@/calendar.js'

var u = AuraCalendar.utilities
u.either = function (a, b) {
	return a || b
}
var event = {
	year: {
		single: function (params) {
			if (!params) params = {}
			var now = new Date()
			now.setMonth(u.random(11))
			params.beginDate = now
			params.endDate = now
			params.title = 'single'
			return this.custom(params)
		},
		inside: function (params) {
			if (!params) params = {}
			var now = new Date()
			var monthBegin = u.random(11)
			now.setMonth(monthBegin)
			var dateBegin = new Date(now)
			now.setMonth(monthBegin + u.random(10 - monthBegin))
			var dateEnd = new Date(now)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'inside'
			return this.custom(params)
		},
		pre: function (params) {
			if (!params) params = {}
			var now = new Date()
			now.setFullYear(2000)
			var dateBegin = new Date(now)
			now.setFullYear(new Date().getFullYear())
			now.setMonth(u.random(11))
			var dateEnd = new Date(now)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'pre'
			return this.custom(params)
		},
		post: function (params) {
			if (!params) params = {}
			var now = new Date()
			now.setMonth(u.random(11))
			var dateBegin = new Date(now)
			now.setFullYear(3000)
			var dateEnd = new Date(now)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'post'
			return this.custom(params)
		},
		both: function (params) {
			if (!params) params = {}
			var now = new Date()
			now.setFullYear(2000)
			var dateBegin = new Date(now)
			now.setFullYear(3000)
			var dateEnd = new Date(now)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'both'
			return this.custom(params)
		},
		before: function (params) {
			if (!params) params = {}
			var now = new Date()
			now.setFullYear(2000)
			var dateBegin = new Date(now)
			now.setFullYear(2001)
			now.setMonth(u.random(11))
			var dateEnd = new Date(now)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'before'
			return this.custom(params)
		},
		after: function (params) {
			if (!params) params = {}
			var now = new Date()
			now.setFullYear(3000)
			var dateBegin = new Date(now)
			now.setFullYear(3001)
			now.setMonth(u.random(11))
			var dateEnd = new Date(now)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'after'
			return this.custom(params)
		},
		bulk: function () {
			return [
				this.single(),
				this.inside(),
				this.pre(),
				this.post(),
				this.both(),
				this.single(),
				this.inside(),
				this.pre(),
				this.post(),
				this.both()
			]
		},
		custom: function (params) {
			if (!params) params = {}
			params.title += ' fvya fvya fvya fyva yfva fyva fyva fyv afyva fy vafyvafvyafy vafyv afyva fyva fyv a'
			return {
				key: u.either(params.key, u.random(1000000)),
				beginDate: params.beginDate,
				endDate: params.endDate,
				data: {
					title: params.title
				}
			}
		}
	},
	month: {
		single: function (params) {
			if (!params) params = {}
			var now = new Date()
			now.setDate(u.random(u.daysInMonth(now) - 1))
			params.beginDate = now
			params.endDate = now
			params.title = 'single'
			return this.custom(params)
		},
		inside: function (params) {
			if (!params) params = {}
			var now = new Date()
			var dayBegin = u.random(u.daysInMonth(now) - 1)
			now.setDate(dayBegin)
			var dateBegin = new Date(now)
			var dayEnd = dayBegin + u.random(u.daysInMonth(now) - 1 - dayBegin)
			now.setDate(dayEnd)
			var dateEnd = new Date(now)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'inside'
			return this.custom(params)
		},
		long: function (params) {
			if (!params) params = {}
			var now = new Date()
			var dayBegin = 1
			now.setDate(dayBegin)
			var dateBegin = new Date(now)
			var dayEnd = u.daysInMonth(now) - 1
			now.setDate(dayEnd)
			var dateEnd = new Date(now)

			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'long'
			return this.custom(params)
		},
		pre: function (params) {
			if (!params) params = {}
			var dateBegin = new Date()
			dateBegin.setFullYear(2000)
			var dateEnd = new Date()
			dateEnd.setDate(u.random(u.daysInMonth(dateEnd) - 1))
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'pre'
			return this.custom(params)
		},
		post: function (params) {
			if (!params) params = {}
			var dateBegin = new Date()
			dateBegin.setDate(u.random(u.daysInMonth(dateBegin) - 1))
			var dateEnd = new Date()
			dateEnd.setFullYear(3000)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'post'
			return this.custom(params)
		},
		both: function (params) {
			if (!params) params = {}
			var dateBegin = new Date()
			dateBegin.setFullYear(2000)
			var dateEnd = new Date()
			dateEnd.setFullYear(3000)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'both'
			return this.custom(params)
		},
		before: function (params) {
			if (!params) params = {}
			var dateBegin = new Date()
			dateBegin.setFullYear(2000)
			var dateEnd = new Date()
			dateEnd.setFullYear(2001)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'before'
			return this.custom(params)
		},
		after: function (params) {
			if (!params) params = {}
			var dateBegin = new Date()
			dateBegin.setFullYear(3000)
			var dateEnd = new Date()
			dateEnd.setFullYear(3001)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'after'
			return this.custom(params)
		},
		bulk: function () {
			return [
				this.single(),
				this.inside(),
				this.long(),
				this.pre(),
				this.post(),
				this.both(),
				this.before(),
				this.after()
			]
		},
		custom: function (params) {
			if (!params) params = {}
			params.title += ' fvya fvya fvya fyva yfva fyva fyva fyv afyva fy vafyvafvyafy vafyv afyva fyva fyv a'
			return {
				key: u.either(params.key, u.random(1000000)),
				beginDate: params.beginDate,
				endDate: params.endDate,
				data: {
					title: params.title
				}
			}
		}
	},
	week: {
		single: function (params) {
			if (!params) params = {}
			var now = new Date()
			now.setDate(now.getDate() - u.shiftSunday(now.getDay()))
			now.setDate(now.getDate() - 1 + u.random(6))
			params.beginDate = now
			params.endDate = now
			params.title = 'single'
			return this.custom(params)
		},
		inside: function (params) {
			if (!params) params = {}
			var now = new Date()
			var dateBegin = new Date(now)
			dateBegin.setDate(now.getDate() - u.shiftSunday(now.getDay()))
			dateBegin.setDate(dateBegin.getDate() + u.random(6))
			dateBegin.setHours(u.random(23))
			var dateEnd = new Date(now)
			var beginDay = u.shiftSunday(dateBegin.getDay())
			dateEnd.setDate(dateEnd.getDate() + beginDay + u.random(6 - beginDay))
			dateEnd.setHours(u.random(23))
			if (dateBegin.getDate() === dateEnd.getDate()) {
				dateEnd.setDate(dateEnd.getDate() + 1)
			}
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'inside'
			return this.custom(params)
		},
		long: function (params) {
			if (!params) params = {}
			var now = new Date()
			var dateBegin = new Date(now)
			dateBegin.setDate(now.getDate() - u.shiftSunday(now.getDay()))
			dateBegin.setDate(dateBegin.getDate() + u.random(6))
			dateBegin.setHours(u.random(23))
			var dateEnd = new Date(now)
			var beginDay = u.shiftSunday(dateBegin.getDay())
			dateEnd.setDate(dateEnd.getDate() + beginDay + u.random(6 - beginDay))
			dateEnd.setHours(u.random(23))
			if (dateBegin.getDate() === dateEnd.getDate()) {
				dateEnd.setDate(dateEnd.getDate() + 1)
			}
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'long'
			return this.custom(params)
		},
		pre: function (params) {
			if (!params) params = {}
			var now = new Date()
			var dateBegin = new Date()
			dateBegin.setFullYear(2000)
			var dateEnd = new Date(now)
			var beginDay = u.shiftSunday(dateBegin.getDay())
			dateEnd.setDate(dateEnd.getDate() + beginDay + u.random(6 - beginDay))
			dateEnd.setHours(u.random(23))
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'pre'
			return this.custom(params)
		},
		post: function (params) {
			if (!params) params = {}
			var now = new Date()
			var dateBegin = new Date()
			dateBegin.setDate(now.getDate() - u.shiftSunday(now.getDay()))
			dateBegin.setDate(dateBegin.getDate() + u.random(6))
			dateBegin.setHours(u.random(23))
			var dateEnd = new Date()
			dateEnd.setFullYear(3001)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'post'
			return this.custom(params)
		},
		both: function (params) {
			if (!params) params = {}
			var dateBegin = new Date()
			dateBegin.setFullYear(2000)
			var dateEnd = new Date()
			dateEnd.setFullYear(3001)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'both'
			return this.custom(params)
		},
		before: function (params) {
			if (!params) params = {}
			var dateBegin = new Date()
			dateBegin.setFullYear(2000)
			var dateEnd = new Date()
			dateEnd.setFullYear(2001)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'before'
			return this.custom(params)
		},
		after: function (params) {
			if (!params) params = {}
			var dateBegin = new Date()
			dateBegin.setFullYear(3000)
			var dateEnd = new Date()
			dateEnd.setFullYear(3001)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'after'
			return this.custom(params)
		},
		bulk: function () {
			return [
				this.single(),
				this.inside(),
				this.inside(),
				this.inside(),
				this.inside(),
				this.inside(),
				this.long(),
				// this.pre(),
				// this.post(),
				// this.both(),
				this.before(),
				this.after()
			]
		},
		custom: function (params) {
			if (!params) params = {}
			params.title += ' Повседневная практика показывает, что постоянный количественный рост и сфера нашей активности требуют от нас анализа системы обучения кадров, соответствует насущным потребностям. Задача организации, в особенности же укрепление и развитие структуры требуют определения и уточнения форм развития. Значимость этих проблем настолько очевидна, что реализация намеченных плановых'
			return {
				key: u.either(params.key, u.random(1000000)),
				beginDate: params.beginDate,
				endDate: params.endDate,
				data: {
					title: params.title
				}
			}
		}
	},
	day: {
		single: function (params) {
			if (!params) params = {}
			var now = new Date()
			now.setHours(u.random(23))
			params.beginDate = now
			params.endDate = now
			params.title = 'single'
			return this.custom(params)
		},
		inside: function (params) {
			if (!params) params = {}
			var now = new Date()
			var dateBegin = new Date(now)
			var hours = u.random(23)
			dateBegin.setHours(hours)
			var dateEnd = new Date(now)
			dateEnd.setHours(hours + u.random(23 - hours))
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'inside'
			return this.custom(params)
		},
		long: function (params) {
			if (!params) params = {}
			var now = new Date()
			var dateBegin = new Date(now)
			var hours = u.random(3)
			dateBegin.setHours(hours)
			var dateEnd = new Date(now)
			dateEnd.setHours(3 + 18 + u.random(3))
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'long'
			return this.custom(params)
		},
		pre: function (params) {
			if (!params) params = {}
			var now = new Date()
			var dateBegin = new Date(now)
			dateBegin.setFullYear(2000)
			var dateEnd = new Date(now)
			dateEnd.setHours(u.random(23))
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'pre'
			return this.custom(params)
		},
		post: function (params) {
			if (!params) params = {}
			var now = new Date()
			var dateBegin = new Date(now)
			dateBegin.setHours(u.random(23))
			var dateEnd = new Date(now)
			dateEnd.setFullYear(3000)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'post'
			return this.custom(params)
		},
		both: function (params) {
			if (!params) params = {}
			var dateBegin = new Date()
			dateBegin.setFullYear(2000)
			var dateEnd = new Date()
			dateEnd.setFullYear(3000)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'both'
			return this.custom(params)
		},
		before: function (params) {
			if (!params) params = {}
			var dateBegin = new Date()
			dateBegin.setFullYear(2000)
			var dateEnd = new Date()
			dateEnd.setFullYear(2001)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'before'
			return this.custom(params)
		},
		after: function (params) {
			if (!params) params = {}
			var dateBegin = new Date()
			dateBegin.setFullYear(3000)
			var dateEnd = new Date()
			dateEnd.setFullYear(3001)
			params.beginDate = dateBegin
			params.endDate = dateEnd
			params.title = 'after'
			return this.custom(params)
		},
		bulk: function () {
			return [
				this.single(),
				this.inside(),
				this.inside(),
				this.inside(),
				this.inside(),
				this.inside(),
				this.long(),
				this.pre(),
				this.post(),
				this.both(),
				this.before(),
				this.after()
			]
		},
		custom: function (params) {
			if (!params) params = {}
			params.title += ' Повседневная практика показывает, что постоянный количественный рост и сфера нашей активности требуют от нас анализа системы обучения кадров, соответствует насущным потребностям. Задача организации, в особенности же укрепление и развитие структуры требуют определения и уточнения форм развития. Значимость этих проблем настолько очевидна, что реализация намеченных плановых'
			return {
				key: u.either(params.key, u.random(1000000)),
				beginDate: params.beginDate,
				endDate: params.endDate,
				data: {
					title: params.title
				}
			}
		}
	}
}
var mode = 'day'
// console.log(AuraCalendar);
var calendar = new AuraCalendar({
	container: '#calendar',
	view: mode,
	eventHeight: 4,
	views: ['year', 'month', 'week', 'day'],
	getTitle: function () {
		return this.getKey() + ' ' + this.data.title
	},
	getDescription: function () {
		return this
	},
	getColor: function () {
		// return 'rgb(46, 115, 180)'
		return u.color()
		return '#' + this.getKey().toString(16).slice(0, 7)
		return '#111111'
	},
	onEventClick: function (event) {
		event.remove()
	}
})


console.log(calendar)
window.auraCalendar = calendar
calendar.render()
var date1 = new Date
var date2 = new Date
var date3 = new Date
date1.setDate(9)
date2.setDate(3)
date3.setDate(5)
window.eventGenerator = event[mode]
// var event = event.year.single()
var events = [{
	key: 1,
	beginDate: date2,
	endDate: date2
},
{
	key: 2,
	beginDate: date2,
	endDate: date2
},

]
var e1 = event[mode].bulk()
// console.log(e1.beginDate.format('dd.MM.yyyy'), e1.endDate.format('dd.MM.yyyy'));

calendar.insertEvent(e1)
// calendar.insertEvent([{
// 	key: 3,
// 	beginDate: date3,
// 	endDate: date3
// },
// {
// 	key: 4,
// 	beginDate: date3,
// 	endDate: date3
// }])
// calendar.insertEvent({
// 	key: 5,
// 	beginDate: date1,
// 	endDate: date1
// })

window.add = () => {
	calendar.insertEvent({
		key: 6,
		beginDate: date1,
		endDate: date1
	})
}
// calendar.removeEvent(event)




const div = (x, y) => x * Math.pow(y, -1)

// console.log(div(0, 1)) // 0
// console.log(div(1, 0)) // Infinity
// console.log(div(0, 0)) // NaN or Infinity Or 0
// console.log(div(4, 2)) // 2
// console.log(div(2, 2)) // 1
// console.log(div(-4, 2)) // -2
// console.log(div(-4, -2)) // 2
// console.log(div(1, 2)) // .5
// console.log(div(.1, .1)) // 1
// console.log(div(1, .3)) // 0.3333333333333333
// console.log(div(Math.PI, 2)) // 1.5707963267948966
