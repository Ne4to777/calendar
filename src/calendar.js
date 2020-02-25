import $ from 'jquery'

//  =============================================================================================
//  ========     ======  =====  ========        ==  =======  ==       ======  =====       =======
//  =======  ===  ====    ====  ========  ========   ======  ==  ====  ====    ====  ====  ======
//  ======  =========  ==  ===  ========  ========    =====  ==  ====  ===  ==  ===  ====  ======
//  ======  ========  ====  ==  ========  ========  ==  ===  ==  ====  ==  ====  ==  ===   ======
//  ======  ========  ====  ==  ========      ====  ===  ==  ==  ====  ==  ====  ==      ========
//  ======  ========        ==  ========  ========  ====  =  ==  ====  ==        ==  ====  ======
//  ======  ========  ====  ==  ========  ========  =====    ==  ====  ==  ====  ==  ====  ======
//  =======  ===  ==  ====  ==  ========  ========  ======   ==  ====  ==  ====  ==  ====  ======
//  ========     ===  ====  ==        ==        ==  =======  ==       ===  ====  ==  ====  ======
//  =============================================================================================

var AuraCalendar = (function AURA_CALENDAR_MODULE() {
	// Constructor
	var AuraCalendar = function (params) {
		if (!params) params = {}

		this.grid = {}
		this.datePicker = {}
		this.state = {}

		var functionValidator = AuraCalendar.utilities.functionValidator
		var views = params.views || AuraCalendar.NAMES.VIEWS
		this.params = {
			container: params.container || '.calendar',
			views: views,
			view: params.view || views[0] || 'year',
			date: params.date || new Date(),
			fixedRowHeight: params.fixedRowHeight || false,
			eventHeight: params.eventHeight,
			getTitle: functionValidator(params.getTitle),
			getDescription: functionValidator(params.getDescription),
			getColor: functionValidator(params.getColor),
			on: {
				next: functionValidator(params.onNext),
				previous: functionValidator(params.onPrevious),
				stateChanged: functionValidator(params.onStateChanged),
				eventClick: functionValidator(params.onEventClick)
			}
		}

		this.$ = {
			container: {},
			wrapper: {},
			buttons: {
				container: {},
				today: {},
				year: {}
			},
			datePicker: {},
			grid: {},
		}

		initState.call(this)
		computeDatesRange.call(this)
		computeIsTodayInView.call(this)
		buildMainView.call(this)
		initDatePicker.call(this)
		initGrid.call(this)

	}
	AuraCalendar.prototype = {
		build: function (params) {
			this.$.container = AuraCalendar.utilities.get$node(this.params.container)
			this.datePicker.render(params)
			this.grid.render(params)
		},
		render: function (params) {
			this.$.container = AuraCalendar.utilities.get$node(this.params.container)
			this.$.container.html(this.$.wrapper)
			this.datePicker.render(params)
			this.grid.render(params)
		},
		clear: function () { this.grid.clear() },
		getEvent: function (key) {
			this.grid.getItem(key)
		},
		insertEvent: function (data) {
			var u = AuraCalendar.utilities
			var items = u.isArray(data)
				? data.map(getEventIteratorInstance.bind(this))
				: [getEventIteratorInstance.call(this, data)]
			this.grid.insertItem(items)
		},
		removeEvent: function (instance) { this.grid.removeItem(instance) },
		setState: function (state) {
			this.state = state
		},
		removeEmptyRows: function () {
			this.grid.removeEmptyRows()
		},
		hasView: function (view) {
			return this.params.views.indexOf(view) >= 0
		}
	}

	// Internal
	function buildMainView() {
		this.$.datePicker = $('<div/>')
			.addClass('aura-calendar__date-picker')
		this.$.buttons.container = $('<div/>')
			.addClass('aura-calendar__buttons')
		this.$.buttons.year = $('<div/>')
			.addClass('aura-calendar__button aura-calendar__button_year')
			.text('Год')
			.off('click')
			.click(this.setState.bind(this, { view: 'year' }))
		this.$.buttons.month = $('<div/>')
			.addClass('aura-calendar__button aura-calendar__button_month')
			.text('Месяц')
			.off('click')
			.click(this.setState.bind(this, { view: 'month' }))
		this.$.buttons.week = $('<div/>')
			.addClass('aura-calendar__button aura-calendar__button_week')
			.text('Неделя')
			.off('click')
			.click(this.setState.bind(this, { view: 'week' }))
		this.$.buttons.today = $('<div/>')
			.addClass('aura-calendar__button aura-calendar__button_today')
			.text('Сегодня')
			.off('click')
			.click(this.setState.bind(this, { date: new Date }))
		this.$.buttons.container
			.append($('<div/>')
				.addClass('aura-calendar__buttons_period')
				.append(this.$.buttons.year)
				.append(this.hasView('week') ? this.$.buttons.month : undefined)
				.append(this.hasView('day') ? this.$.buttons.week : undefined)
			)
			.append(this.$.buttons.today)
		this.$.grid = $('<div/>')
			.addClass('aura-calendar__grid')
		this.$.wrapper = $('<div/>')
			.addClass('aura-calendar')
			.append($('<div/>')
				.addClass('aura-calendar__panel_top')
				.append(this.$.datePicker)
				.append(this.$.buttons.container)
			)
			.append(this.$.grid)
		updateYearButton.call(this)
		updateMonthButton.call(this)
		updateWeekButton.call(this)
		updateTodayButton.call(this)
	}
	function computeDatesRange() {
		this.datesRange = periodDispatcher[this.state.view].buildRange(this.state.date)
	}
	function computeIsTodayInView() {
		var now = new Date()
		var datesComparator = AuraCalendar.utilities.datesComparator.month
		var datesRange = this.datesRange
		this.isTodayInView = datesComparator(now, datesRange[0]) > -1 && datesComparator(now, datesRange[datesRange.length - 1]) < 1
	}
	function initGrid() {
		var it = this
		this.grid = new AuraCalendar.Grid({
			parent: this,
			container: this.$.grid,
			view: this.params.view,
			date: this.params.date,
			fixedRowHeight: this.params.fixedRowHeight,
			getTitle: this.params.getTitle,
			getDescription: this.params.getDescription,
			getColor: this.params.getColor,
			onItemClick: function (event) {
				it.params.on.eventClick.call(it.params.parent, event)
			}
		})
	}
	function initDatePicker() {
		this.datePicker = new AuraCalendar.DatePicker({
			parent: this,
			container: this.$.datePicker,
			view: this.params.view,
			date: this.params.date
		})
	}
	function initState() {
		var state = {
			view: this.params.view,
			date: this.params.date
		}
		Object.defineProperties(this, {
			state: {
				get: function () {
					return state
				},
				set: function (value) {
					var view = value.view
					var date = value.date
					if (view || date) {
						if (view) state.view = view
						if (date) state.date = date

						computeDatesRange.call(this)
						computeIsTodayInView.call(this)

						if (view) {
							updateYearButton.call(this)
							updateMonthButton.call(this)
							updateWeekButton.call(this)
						}
						if (date) {
							updateTodayButton.call(this)
						}
						this.datePicker.stateChangeHandler()
						this.grid.stateChangeHandler()
					}
					this.params.on.stateChanged.call(this, this.state)
				}
			}
		})
	}
	function updateYearButton() {
		this.$.buttons.year[periodDispatcher[this.state.view].yearButtonVisible ? 'removeClass' : 'addClass']('display_none')
	}
	function updateMonthButton() {
		this.hasView('week') && this.$.buttons.month[periodDispatcher[this.state.view].monthButtonVisible ? 'removeClass' : 'addClass']('display_none')
	}
	function updateWeekButton() {
		this.hasView('day') && this.$.buttons.week[periodDispatcher[this.state.view].weekButtonVisible ? 'removeClass' : 'addClass']('display_none')
	}
	function updateTodayButton() {
		this.$.buttons.today[this.isTodayInView ? 'addClass' : 'removeClass']('display_none')
	}
	function getEventIteratorInstance(item) {
		return item instanceof AuraCalendar.EventIterator
			? item
			: new AuraCalendar.EventIterator(this, item, {
				getTitle: this.params.getTitle,
				getDescription: this.params.getDescription,
				getColor: this.params.getColor
			})
	}

	var periodDispatcher = {
		year: {
			buildRange: function (date) {
				var year = date.getFullYear()
				return AuraCalendar.NAMES.MONTHES.map(function (name, i) {
					return new Date(year, i, 1)
				})
			},
			yearButtonVisible: false,
			monthButtonVisible: false,
			weekButtonVisible: false
		},
		month: {
			buildRange: function (date) {
				var vector = []
				var u = AuraCalendar.utilities
				var firstDayInView = -u.firstDayInMonth(date)
				var lastDayInView = 6 - u.lastDayInMonth(date) + u.daysInMonth(date)
				for (var j = firstDayInView + 1, i = 0; j <= lastDayInView; j++ , i++) {
					var actualDate = new Date(date)
					actualDate.setDate(j)
					vector.push(actualDate)
				}
				return vector
			},
			yearButtonVisible: true,
			monthButtonVisible: false,
			weekButtonVisible: false
		},
		week: {
			buildRange: function (date) {
				var vector = []
				var u = AuraCalendar.utilities
				var dayInWeek = u.shiftSunday(date.getDay())
				var firstDateInView = new Date(date)
				firstDateInView.setDate(firstDateInView.getDate() - dayInWeek)
				var currentDate = new Date(
					firstDateInView.getFullYear(),
					firstDateInView.getMonth(),
					firstDateInView.getDate()
				)
				for (var i = 0; i < 7; i++) {
					vector.push(currentDate)
					currentDate = new Date(currentDate)
					currentDate.setDate(currentDate.getDate() + 1)
				}
				return vector
			},
			yearButtonVisible: true,
			monthButtonVisible: true,
			weekButtonVisible: false
		},
		day: {
			buildRange: function (date) {
				return [date]
			},
			yearButtonVisible: true,
			monthButtonVisible: true,
			weekButtonVisible: true
		}
	}

	return AuraCalendar
}())

AuraCalendar.NAMES = {
	VIEWS: ['year', 'month', 'week', 'day'],
	MONTHES: [
		'Январь',
		'Февраль',
		'Март',
		'Апрель',
		'Май',
		'Июнь',
		'Июль',
		'Август',
		'Сентябрь',
		'Октябрь',
		'Ноябрь',
		'Декабрь'
	],
	MONTHES_CASE: [
		'Января',
		'Февраля',
		'Марта',
		'Апреля',
		'Мая',
		'Июня',
		'Июля',
		'Августа',
		'Сентября',
		'Октября',
		'Ноября',
		'Декабря'
	],
	DAYS: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
	HOURS: [
		'00', '01', '02', '03', '04', '05',
		'06', '07', '08', '09', '10', '11',
		'12', '13', '14', '15', '16', '17',
		'18', '19', '20', '21', '22', '23'
	]
}

//  ==============================================
//  =======      ===       ===    ==       =======
//  ======   ==   ==  ====  ===  ===  ====  ======
//  ======  ====  ==  ====  ===  ===  ====  ======
//  ======  ========  ===   ===  ===  ====  ======
//  ======  ========      =====  ===  ====  ======
//  ======  ===   ==  ====  ===  ===  ====  ======
//  ======  ====  ==  ====  ===  ===  ====  ======
//  ======   ==   ==  ====  ===  ===  ====  ======
//  =======      ===  ====  ==    ==       =======
//  ==============================================

AuraCalendar.Grid = (function GRID_MODULE() {
	// Constructor
	function Grid(params) {
		if (!params) params = {}
		var u = AuraCalendar.utilities
		var functionValidator = u.functionValidator
		this.itemsMap = {}
		this.params = {
			parent: params.parent,
			container: params.container || '.aura-calendar__grid',
			date: params.date || new Date(),
			view: params.view || 'year',
			fixedRowHeight: params.fixedRowHeight,
			getTitle: functionValidator(params.getTitle),
			getDescription: functionValidator(params.getDescription),
			getColor: functionValidator(params.getColor),
			on: {
				render: functionValidator(params.onRender),
				destroy: functionValidator(params.onDestroy),
				clear: functionValidator(params.onClear),
				itemClick: functionValidator(params.onItemClick),
			}
		}

		this.$ = {
			container: u.get$node(params.container),
			wrapper: $('<div/>'),
			table: {}
		}
		this.state = this.params.parent.state
		buildMainView.call(this)
	}
	Grid.prototype = {

		setState: function (state) {
			this.params.parent.setState(state)
		},
		render: function () {
			this.$.container.html(this.$.wrapper)
			this.params.on.render.call(this)
		},
		destroy: function (params) {
			this.params.on.destroy.call(this, params)
			this.$.container.remove(this.$.wrapper)
		},
		getItem: function (key) {
			return this.$.table.find('[data-key="' + key + '"]')
		},
		insertItem: function (items) {
			var it = this
			var datesRange = this.params.parent.datesRange
			var firstDateInView = new Date(datesRange[0])
			firstDateInView.setHours(0)
			firstDateInView.setMinutes(0)
			firstDateInView.setSeconds(0)
			var lastDateInView = new Date(datesRange.slice(-1)[0])
			lastDateInView.setHours(23)
			lastDateInView.setMinutes(59)
			lastDateInView.setSeconds(59)

			var datesComparator = AuraCalendar.utilities.datesComparator[it.state.view]
			items
				.sort(function (a, b) {
					return a.items[0].getBeginDate().getTime() > b.items[0].getBeginDate().getTime() ? 1 : -1
				})
				.map(function (iterator, i) {
					var key = iterator.getKey()
					it.removeItem(key)
					it.itemsMap[key] = iterator
					iterator.map(function (instance) {
						var beginDate = instance.getBeginDate()
						var endDate = instance.getEndDate()
						if (!beginDate || !endDate) return
						if (datesComparator(beginDate, lastDateInView) > 0 || datesComparator(endDate, firstDateInView) < 0) return
						var isBeganBefore = datesComparator(beginDate, firstDateInView) < 0
						var isEndedBefore = datesComparator(endDate, lastDateInView) > 0
						var firstCellDate = isBeganBefore ? firstDateInView : beginDate
						var lastCellDate = isEndedBefore ? lastDateInView : endDate
						instance.render({
							cells: tableBuilder[it.state.view].getCellsToInsert(it, firstCellDate, lastCellDate),
							isBeganBefore: isBeganBefore,
							isEndedBefore: isEndedBefore
						})

					})
				})
		},
		removeItem: function (key) {
			var iterator = this.itemsMap[key]
			iterator && iterator.remove()
		},
		clear: function () {
			buildMainView.call(this)
			this.params.on.clear.call(this)
		},
		stateChangeHandler: function () {
			buildMainView.call(this)
		},
		removeEmptyRows: function () {
			this.$.table
				.find('.aura-calendar__body')
				.each(function (i, body) {
					$(body)
						.find('.aura-calendar__body-row_item')
						.each(function (i, row) {
							var $row = $(row)
							var $events = $row.find('.aura-calendar__event')
							if ($row.siblings().length > 1 && !$events.length) $row.remove()
						})
				})
		}
	}
	// Internal

	function buildMainView() {
		this.$.table = tableBuilder[this.state.view].build(this)
		this.$.wrapper.html(this.$.table)
	}

	function getDateQuery(params) {
		if (!params) params = {}
		var yearQuery = params.year === undefined ? '' : '[data-year="' + params.year + '"]'
		var monthQuery = params.month === undefined ? '' : '[data-month="' + params.month + '"]'
		var dayQuery = params.day === undefined ? '' : '[data-day="' + params.day + '"]'
		var weekDayQuery = params.weekDay === undefined ? '' : '[data-week-day="' + params.weekDay + '"]'
		var hourQuery = params.hour === undefined ? '' : '[data-hour="' + params.hour + '"]'
		var elQuery = params.el || ''
		return elQuery + yearQuery + monthQuery + weekDayQuery + dayQuery + hourQuery
	}

	var tableBuilder = {
		year: {
			build: function (context) {
				var now = new Date()
				var $table = this.get$table(context)
				if (context.params.parent.isTodayInView) {
					$table.find(getDateQuery({
						year: now.getFullYear(),
						month: now.getMonth(),
						el: '.aura-calendar__head-cell'
					}))
						.addClass('aura-calendar__head-cell_active-horizontal')
				}
				return $table
			},
			get$table: function (context) {
				return $('<table/>')
					.addClass('aura-calendar__table')
					.append(this.get$head(context), this.get$bodies(context))
			},
			get$head: function (context) {
				var date = context.state.date
				var year = date.getFullYear()
				return $('<thead/>')
					.addClass('aura-calendar__head')
					.append(AuraCalendar.NAMES.MONTHES.reduce(function ($acc, name, i) {
						$('<th/>')
							.addClass('aura-calendar__head-cell aura-calendar__head-cell_year')
							.attr('data-year', year)
							.attr('data-month', i)
							.text(name)
							.appendTo($acc)
						return $acc
					}, $('<tr/>')
						.addClass('aura-calendar__head-row aura-calendar__head-row_year'))
						.off('click').click(function (e) {
							var date = new Date(context.state.date.getFullYear(), $(e.target).data('month'), 1)
							var view = 'month'
							context.setState({ date: date, view: view })
						}))
			},
			get$bodies: function () {
				return [this.get$body()]
			},
			get$body: function () {
				return $('<tbody/>')
					.addClass('aura-calendar__body aura-calendar__body_year')
					.html(this.get$bodyRow())
			},
			get$bodyRow: function () {
				return $('<tr/>')
					.addClass('aura-calendar__body-row_item aura-calendar__body-row_year')
					.html(AuraCalendar.NAMES.MONTHES.reduce(function (acc, el, i) {
						return acc.concat($('<td/>')
							.addClass('aura-calendar__body-cell_year  aura-calendar__body-cell_item')
							.attr('data-month', i))
					}, []))
			},
			getCellsToInsert: function (context, firstCellDate, lastCellDate) {
				var $table = context.$.table
				var $rows = $table.find('.aura-calendar__body-row_item')
				var cellsToInsertItem = []
				var firstMonth = firstCellDate.getMonth()
				var lastMonth = lastCellDate.getMonth()
				$rows.each(function (i, row) {
					var $row = $(row)
					var currentMonth = firstMonth
					do {
						var $cell = $row.find('[data-month="' + currentMonth + '"]')
						if ($cell.is(':empty')) {
							cellsToInsertItem.push($cell)
						} else {
							cellsToInsertItem = []
							break;
						}
					} while (currentMonth++ < lastMonth)
					if (cellsToInsertItem.length) return false
				})

				if (!cellsToInsertItem.length) {
					var new$row = this.get$bodyRow()
					$table.find('.aura-calendar__body').append(new$row)
					var currentMonth = firstMonth
					do {
						var $cell = new$row.find('[data-month="' + currentMonth + '"]')
						cellsToInsertItem.push($cell)
					} while (currentMonth++ < lastMonth)
				}
				return {
					item: cellsToInsertItem,
					title: [cellsToInsertItem]
				}
			}
		},
		month: {
			build: function (context) {
				var $table = this.get$table(context)
				var now = new Date()
				var parent = context.params.parent
				if (parent.hasView('day')) {
					$table
						.find('.aura-calendar__day-number')
						.addClass('aura-calendar__body-cell_head_clickable')
						.off('click')
						.click(function (e) {
							e.stopPropagation()
							var $cell = $(this).parent()
							var date = new Date($cell.attr('data-year'), $cell.attr('data-month'), $cell.attr('data-day'))
							context.setState({
								view: 'day',
								date: date
							})
						})
				}
				if (parent.hasView('week')) {
					$table
						.find('.aura-calendar__body-row_head')
						.addClass('aura-calendar__body-row_head_clickable')
						.find('.aura-calendar__body-cell_head')
						.off('click')
						.click(function (e) {
							var $cell = $(this)
							var date = new Date($cell.attr('data-year'), $cell.attr('data-month'), $cell.attr('data-day'))
							context.setState({
								view: 'week',
								date: date
							})
						})

				}
				if (parent.isTodayInView) {
					$table
						.find(getDateQuery({
							year: now.getFullYear(),
							month: now.getMonth(),
							day: now.getDate(),
							el: '.aura-calendar__body-cell_head'
						}))
						.addClass('aura-calendar__body-cell_active')
					$table
						.find(getDateQuery({
							year: now.getFullYear(),
							month: now.getMonth(),
							weekDay: AuraCalendar.utilities.shiftSunday(now.getDay()),
							el: '.aura-calendar__head-cell'
						}))
						.addClass('aura-calendar__head-cell_active-horizontal')
				}

				return $table
			},
			get$table: function (context) {
				return $('<table/>')
					.addClass('aura-calendar__table')
					.append(this.get$head(context), this.get$bodies(context))
			},
			get$head: function (context) {
				var date = context.state.date
				var year = date.getFullYear()
				var month = date.getMonth()
				return $('<thead/>')
					.addClass('aura-calendar__head')
					.html(AuraCalendar.NAMES.DAYS.reduce(function ($acc, name, i) {
						return $acc.append($('<th/>')
							.addClass('aura-calendar__head-cell')
							.attr('data-year', year)
							.attr('data-month', month)
							.attr('data-week-day', i)
							.html(name)
						)
					}, $('<tr/>').addClass('aura-calendar__head-row')))
			},
			get$bodies: function (context) {
				var it = this
				return context.params.parent.datesRange.reduce(function (acc, date, i) {
					if (!(i % 7)) acc.push(it.get$body(context, date))
					return acc
				}, [])
			},
			get$body: function (context, date) {
				return $('<tbody/>')
					.addClass('aura-calendar__body aura-calendar__body_month')
					.html([this.get$bodyHead(context, date), this.get$bodyRow(context, date)])
			},
			get$bodyHead: function (context, date) {
				var tds = []
				var contextDate = context.state.date
				var currentDate = new Date(date)
				for (var i = 0; i < 7; i++) {
					var mutedClass = currentDate.getMonth() === contextDate.getMonth()
						&& currentDate.getFullYear() === contextDate.getFullYear() ? '' : ' aura-calendar__body-cell_muted'
					tds.push(this.getHead$bodyCell(currentDate, mutedClass))
					currentDate.setDate(currentDate.getDate() + 1)
				}

				return $('<tr/>')
					.addClass('aura-calendar__body-row_head')
					.html(tds)
			},
			getHead$bodyCell: function (date, mutedClass) {
				var day = date.getDate()
				return $('<td/>')
					.addClass('aura-calendar__body-cell_month  aura-calendar__body-cell_head' + mutedClass)
					.attr('data-year', date.getFullYear())
					.attr('data-month', date.getMonth())
					.attr('data-day', day)
					.html($('<div/>')
						.addClass('aura-calendar__day-number')
						.html(day)
					)
			},
			get$bodyRow: function (context, date) {
				var tds = []
				var currentDate = new Date(date)
				for (var i = 0; i < 7; i++) {
					tds.push(this.get$bodyCell(currentDate))
					currentDate.setDate(currentDate.getDate() + 1)
				}
				return $('<tr/>')
					.addClass('aura-calendar__body-row_item aura-calendar__body-row_month')
					.html(tds)
			},
			get$bodyCell: function (date) {
				return $('<td/>')
					.addClass('aura-calendar__body-cell_month  aura-calendar__body-cell_item')
					.attr('data-year', date.getFullYear())
					.attr('data-month', date.getMonth())
					.attr('data-day', date.getDate())
			},
			getDateFrom$cell: function ($cell) {
				return new Date(
					$cell.attr('data-year'),
					$cell.attr('data-month'),
					$cell.attr('data-day')
				)
			},
			getCellsToInsert: function (context, firstCellDate, lastCellDate) {
				var rowIsFull, dateIsOver
				var datesComparator = AuraCalendar.utilities.datesComparator.month
				var data = {
					item: [],
					title: []
				}
				var current$body = context.$.table.find(getDateQuery({
					el: '.aura-calendar__body-cell_head',
					year: firstCellDate.getFullYear(),
					month: firstCellDate.getMonth(),
					day: firstCellDate.getDate()
				}))
					.parents('.aura-calendar__body')
				while (current$body.length) {
					var current$row = current$body.find('.aura-calendar__body-row_item').first()
					while (current$row.length) {
						rowIsFull = false
						dateIsOver = false
						var current$cell = current$row.find('.aura-calendar__body-cell_item').first()
						while (current$cell.length) {
							var cellDate = this.getDateFrom$cell(current$cell)
							if (!(datesComparator(cellDate, firstCellDate) < 0)) {
								if (datesComparator(cellDate, lastCellDate) > 0) {
									dateIsOver = true
									break
								}
								if (!current$cell.is(':empty')) {
									rowIsFull = true
									break;
								}
							}
							current$cell = current$cell.next()
						}
						if (dateIsOver || !rowIsFull) break
						current$row = current$row.next()
					}

					if (!current$row.length) {
						current$row = this.get$bodyRow(context, this.getDateFrom$cell(current$body
							.find('.aura-calendar__body-cell_item').first()))
							.appendTo(current$body)
					}

					current$cell = current$row.find('.aura-calendar__body-cell_item').first()

					dateIsOver = false
					var titles = []
					while (current$cell.length) {
						var cellDate = this.getDateFrom$cell(current$cell)
						if (!(datesComparator(cellDate, firstCellDate) < 0)) {
							if (datesComparator(cellDate, lastCellDate) > 0) {
								dateIsOver = true
								break
							}
							data.item.push(current$cell)
							titles.push(current$cell)
						}
						current$cell = current$cell.next()
					}
					if (titles.length) data.title.push(titles)
					if (dateIsOver) break
					current$body = current$body.next()
				}
				return data
			}
		},
		week: {
			build: function (context) {
				var $table = this.get$table(context)
				var now = new Date()
				var parent = context.params.parent
				if (parent.hasView('day')) {
					$table
						.find('.aura-calendar__body-cell_head_first')
						.addClass('aura-calendar__body-cell_head_clickable')
						.off('click')
						.click(function (e) {
							var $cell = $(this)
							var date = new Date($cell.attr('data-year'), $cell.attr('data-month'), $cell.attr('data-day'))
							context.setState({
								view: 'day',
								date: date
							})
						})

				}
				if (parent.isTodayInView) {
					$table
						.find(getDateQuery({
							year: now.getFullYear(),
							month: now.getMonth(),
							day: now.getDate(),
							el: '.aura-calendar__body-cell_head_first'
						}))
						.addClass('aura-calendar__head-cell_active-vertical')

					$table
						.find(getDateQuery({
							year: now.getFullYear(),
							month: now.getMonth(),
							hour: now.getHours(),
							el: '.aura-calendar__head-cell'
						}))
						.addClass('aura-calendar__head-cell_active-horizontal')
					$table
						.find(getDateQuery({
							year: now.getFullYear(),
							month: now.getMonth(),
							day: now.getDate(),
							hour: now.getHours(),
							el: '.aura-calendar__body-cell_head_tail'
						}))
						.find('.aura-calendar__body-cell_head_week_hour')
						.addClass('aura-calendar__head-cell_active-horizontal')
				}
				return $table
			},
			get$table: function (context) {
				return $('<table/>')
					.addClass('aura-calendar__table')
					.append(this.get$head(context), this.get$bodies(context))
			},
			get$head: function (context) {
				var date = context.state.date
				var year = date.getFullYear()
				var month = date.getMonth()
				return $('<thead/>')
					.addClass('aura-calendar__head')
					.html(AuraCalendar.NAMES.HOURS.reduce(function ($acc, name, i) {
						return $acc.append($('<th/>')
							.addClass('aura-calendar__head-cell aura-calendar__head-cell_week')
							.attr('data-year', year)
							.attr('data-month', month)
							.attr('data-hour', i)
							.html(name)
							.append($('<span/>')
								.addClass('aura-calendar__head-cell_sup')
								.html(':00')
							))
					}, $('<tr/>')
						.addClass('aura-calendar__head-row')
						.html($('<th/>')
							.addClass('aura-calendar__head-cell aura-calendar__head-cell_week aura-calendar__head-cell_first'))))
			},
			get$bodies: function (context) {
				var bodies = []
				for (var i = 0; i < 7; i++) {
					bodies.push(this.get$body(context, i))
				}
				return bodies
			},
			get$body: function (context, i) {
				var date = context.params.parent.datesRange[i]
				return $('<tbody/>')
					.addClass('aura-calendar__body aura-calendar__body_week')
					.html([this.get$headRow(context, date), this.get$bodyRow(date)])
			},
			get$headRow: function (context, date) {
				var day = AuraCalendar.utilities.shiftSunday(date.getDay())
				var contextDate = context.state.date
				var currentDate = new Date(date)
				var mutedClass = currentDate.getFullYear() === contextDate.getFullYear()
					&& currentDate.getMonth() === contextDate.getMonth() ? '' : ' aura-calendar__body-cell_muted'
				var tds = [
					$('<td/>')
						.addClass('aura-calendar__body-cell_head_week aura-calendar__body-cell_head aura-calendar__body-cell_head_first' + mutedClass)
						.attr('data-year', date.getFullYear())
						.attr('data-month', date.getMonth())
						.attr('data-day', date.getDate())
						.attr('data-week-day', day)
						.html($('<div/>')
							.addClass('aura-calendar__body-cell_week-name')
							.html(AuraCalendar.NAMES.DAYS[day]))
						.append($('<div/>')
							.addClass('aura-calendar__body-cell_week-day')
							.html(currentDate.getDate()))
				]
				for (var i = 0; i < 24; i++) {
					tds.push(this.get$headCell(currentDate))
					currentDate.setHours(currentDate.getHours() + 1)
				}

				return $('<tr/>')
					.addClass('aura-calendar__body-row_head aura-calendar__body-row_head_week')
					.html(tds)
			},
			get$bodyRow: function (date) {
				var day = AuraCalendar.utilities.shiftSunday(date.getDay())
				var currentDate = new Date(date)
				var tds = [$('<td/>')
					.addClass('aura-calendar__body-cell_week-empty aura-calendar__body-cell_week')
					.attr('data-week-day', day)]
				for (var i = 0; i < 24; i++) {
					tds.push(this.get$bodyCell(currentDate))
					currentDate.setHours(currentDate.getHours() + 1)
				}

				return $('<tr/>')
					.addClass('aura-calendar__body-row_item aura-calendar__body-row_week')
					.html(tds)
			},
			get$headCell: function (date) {
				var hours = date.getHours()
				return $('<td/>')
					.addClass('aura-calendar__body-cell_head_week aura-calendar__body-cell_head aura-calendar__body-cell_head_tail')
					.attr('data-year', date.getFullYear())
					.attr('data-month', date.getMonth())
					.attr('data-day', date.getDate())
					.attr('data-hour', hours)
					.html($('<div/>')
						.addClass('aura-calendar__body-cell_head_week_hour')
						.html(AuraCalendar.NAMES.HOURS[hours])
						.append($('<span/>')
							.addClass('aura-calendar__head-cell_sup')
							.html(':00')
						)
					)
			},
			get$bodyCell: function (date) {
				return $('<td/>')
					.addClass('aura-calendar__body-cell_week  aura-calendar__body-cell_item')
					.attr('data-year', date.getFullYear())
					.attr('data-month', date.getMonth())
					.attr('data-day', date.getDate())
					.attr('data-hour', date.getHours())
			},
			getDateFrom$cell: function ($cell) {
				return new Date(
					$cell.attr('data-year'),
					$cell.attr('data-month'),
					$cell.attr('data-day'),
					$cell.attr('data-hour')
				)
			},
			getCellsToInsert: function (context, firstCellDate, lastCellDate) {
				var rowIsFull, dateIsOver
				var datesComparator = AuraCalendar.utilities.datesComparator.week
				var data = {
					item: [],
					title: []
				}
				var current$body = context.$.table.find(getDateQuery({
					el: '.aura-calendar__body-cell_item',
					year: firstCellDate.getFullYear(),
					month: firstCellDate.getMonth(),
					day: firstCellDate.getDate(),
					hour: firstCellDate.getHours()
				}))
					.parents('.aura-calendar__body')

				while (current$body.length) {
					var current$row = current$body.find('.aura-calendar__body-row_item').first()
					while (current$row.length) {
						rowIsFull = false
						dateIsOver = false
						var current$cell = current$row.find('.aura-calendar__body-cell_item').first()
						while (current$cell.length) {
							var cellDate = this.getDateFrom$cell(current$cell)
							if (!(datesComparator(cellDate, firstCellDate) < 0)) {
								if (datesComparator(cellDate, lastCellDate) > 0) {
									dateIsOver = true
									break
								}
								if (!current$cell.is(':empty')) {
									rowIsFull = true
									break;
								}
							}
							current$cell = current$cell.next()
						}
						if (dateIsOver || !rowIsFull) break
						current$row = current$row.next()
					}

					if (!current$row.length) {
						current$row = this.get$bodyRow(
							this.getDateFrom$cell(
								current$body.find('.aura-calendar__body-cell_item').first()
							)
						)
							.appendTo(current$body)
					}

					current$cell = current$row.find('.aura-calendar__body-cell_item').first()

					dateIsOver = false
					var titles = []
					while (current$cell.length) {
						var cellDate = this.getDateFrom$cell(current$cell)

						if (!(datesComparator(cellDate, firstCellDate) < 0)) {
							if (datesComparator(cellDate, lastCellDate) > 0) {
								dateIsOver = true
								break
							}
							data.item.push(current$cell)
							titles.push(current$cell)
						}
						current$cell = current$cell.next()
					}
					if (titles.length) data.title.push(titles)
					if (dateIsOver) break
					current$body = current$body.next()
				}
				return data
			},
		},
		day: {
			build: function (context) {
				var $table = this.get$table(context)
				var now = new Date()
				if (context.params.parent.isTodayInView) {
					$table.find(getDateQuery({
						year: now.getFullYear(),
						month: now.getMonth(),
						hour: now.getHours(),
						el: '.aura-calendar__head-cell'
					}))
						.addClass('aura-calendar__head-cell_active-horizontal')
				}
				return $table
			},
			get$table: function (context) {
				return $('<table/>')
					.addClass('aura-calendar__table')
					.append(this.get$head(context), this.get$bodies(context))
			},
			get$head: function (context) {
				var date = context.state.date
				var year = date.getFullYear()
				var month = date.getMonth()
				return $('<thead/>')
					.addClass('aura-calendar__head')
					.html(AuraCalendar.NAMES.HOURS.reduce(function ($acc, name, i) {
						return $acc.append($('<th/>')
							.addClass('aura-calendar__head-cell aura-calendar__head-cell_day')
							.attr('data-year', year)
							.attr('data-month', month)
							.attr('data-hour', i)
							.html(name)
							.append($('<span/>')
								.addClass('aura-calendar__head-cell_sup')
								.html(':00')
							))
					}, $('<tr/>')
						.addClass('aura-calendar__head-row')
					))
			},
			get$bodies: function (context) {
				return [this.get$body(context)]
			},
			get$body: function (context) {
				var date = new Date(context.params.parent.datesRange[0])

				return $('<tbody/>')
					.addClass('aura-calendar__body aura-calendar__body_day')
					.html(this.get$bodyRow(date))
			},
			get$bodyRow: function (date) {
				var tds = []
				for (var i = 0; i < 24; i++) {
					date.setHours(i)
					tds.push(this.get$bodyCell(date))
				}

				return $('<tr/>')
					.addClass('aura-calendar__body-row_item aura-calendar__body-row_day')
					.html(tds)
			},
			get$bodyCell: function (date) {
				return $('<td/>')
					.addClass('aura-calendar__body-cell_day  aura-calendar__body-cell_item')
					.attr('data-year', date.getFullYear())
					.attr('data-month', date.getMonth())
					.attr('data-day', date.getDate())
					.attr('data-hour', date.getHours())
			},
			getDateFrom$cell: function ($cell) {
				return new Date(
					$cell.attr('data-year'),
					$cell.attr('data-month'),
					$cell.attr('data-day'),
					$cell.attr('data-hour')
				)
			},
			getCellsToInsert: function (context, firstCellDate, lastCellDate) {
				var $table = context.$.table
				var $rows = $table.find('.aura-calendar__body-row_item')
				var cellsToInsertItem = []
				var firstHour = firstCellDate.getHours()
				var lastHour = lastCellDate.getHours()
				$rows.each(function (i, row) {
					var $row = $(row)
					var currentHour = firstHour
					do {
						var $cell = $row.find('[data-hour="' + currentHour + '"]')
						if ($cell.is(':empty')) {
							cellsToInsertItem.push($cell)
						} else {
							cellsToInsertItem = []
							break;
						}
					} while (currentHour++ < lastHour)
					if (cellsToInsertItem.length) return false
				})

				if (!cellsToInsertItem.length) {
					var new$row = this.get$bodyRow(this.getDateFrom$cell($rows.find('.aura-calendar__body-cell_item').first()))
					$table.find('.aura-calendar__body').append(new$row)
					var currentHour = firstHour
					do {
						var $cell = new$row.find('[data-hour="' + currentHour + '"]')
						cellsToInsertItem.push($cell)
					} while (currentHour++ < lastHour)
				}
				return {
					item: cellsToInsertItem,
					title: [cellsToInsertItem]
				}
			},
		}
	}
	return Grid
}())

//  ==========================================================================================================
//  ======       ======  =====        ==        ==       ===    ====     ===  ====  ==        ==       =======
//  ======  ====  ====    =======  =====  ========  ====  ===  ====  ===  ==  ===  ===  ========  ====  ======
//  ======  ====  ===  ==  ======  =====  ========  ====  ===  ===  ========  ==  ====  ========  ====  ======
//  ======  ====  ==  ====  =====  =====  ========  ====  ===  ===  ========  =  =====  ========  ===   ======
//  ======  ====  ==  ====  =====  =====      ====       ====  ===  ========     =====      ====      ========
//  ======  ====  ==        =====  =====  ========  =========  ===  ========  ==  ====  ========  ====  ======
//  ======  ====  ==  ====  =====  =====  ========  =========  ===  ========  ===  ===  ========  ====  ======
//  ======  ====  ==  ====  =====  =====  ========  =========  ====  ===  ==  ====  ==  ========  ====  ======
//  ======       ===  ====  =====  =====        ==  ========    ====     ===  ====  ==        ==  ====  ======
//  ==========================================================================================================

AuraCalendar.DatePicker = (function DATE_PICKER_MODULE() {
	// Constructor
	function DatePicker(params) {

		this.params = {
			parent: params.parent,
			container: params.container || '.aura-calendar__date-picker',
			date: params.date || new Date(),
			view: params.view || 'year'
		}

		this.$ = {
			container: AuraCalendar.utilities.get$node(this.params.container),
			wrapper: $('<div/>'),
			left: {},
			date: {},
			right: {}
		}

		this.state = this.params.parent.state
		buildMainView.call(this)
	}

	DatePicker.prototype = {
		setState: function (state) {
			this.params.parent.state = state
		},
		render: function () {
			this.$.container.html(this.$.wrapper)
		},
		reset: function () { },
		next: function () {
			move.call(this, 1)
			this.params.parent.params.on.next()
		},
		previous: function () {
			move.call(this, -1)
			this.params.parent.params.on.previous()
		},
		stateChangeHandler: function () {
			this.$.date.html(periodDispatcher[this.state.view].getDateTitle(this.state.date))
		}
	}
	//Internal

	function buildMainView() {
		this.$.date = $('<div/>')
			.addClass('aura-calendar-date-picker__date-container')
			.html(periodDispatcher[this.state.view].getDateTitle(this.state.date))
		this.$.left = $('<div/>')
			.addClass('aura-calendar-date-picker__arrow aura-calendar-date-picker__arrow_left')
			.off('click')
			.click(this.previous.bind(this))

		this.$.right = $('<div/>')
			.addClass('aura-calendar-date-picker__arrow aura-calendar-date-picker__arrow_right')
			.off('click')
			.click(this.next.bind(this))

		this.$.wrapper
			.append(this.$.left)
			.append(this.$.date)
			.append(this.$.right)
	}
	function move(direction) {
		var date = periodDispatcher[this.state.view].getDateByDirection.call(this, direction)
		this.setState({ date: date })
	}

	var periodDispatcher = {
		year: {
			getDateByDirection: function (direction) {
				var date = new Date(this.params.parent.state.date)
				date.setFullYear(date.getFullYear() + direction)
				return date
			},
			getDateTitle: function (date) {
				return $('<div/>')
					.addClass('aura-calendar-date-picker__date')
					.append($('<div/>')
						.addClass('aura-calendar-date-picker__year')
						.html(date.getFullYear())
					)
			}
		},
		month: {
			getDateByDirection: function (direction) {
				var date = new Date(this.params.parent.state.date)
				date.setMonth(date.getMonth() + direction)
				return date
			},
			getDateTitle: function (date) {
				return $('<div/>')
					.addClass('aura-calendar-date-picker__date')
					.append($('<div/>')
						.addClass('aura-calendar-date-picker__month')
						.html(AuraCalendar.NAMES.MONTHES[date.getMonth()])
					)
					.append($('<div/>')
						.addClass('aura-calendar-date-picker__year-week-container')
						.append($('<div/>')
							.addClass('aura-calendar-date-picker__year')
							.html(date.getFullYear())
						)
					)
			}
		},
		week: {
			getDateByDirection: function (direction) {
				var datesRange = this.params.parent.datesRange
				var date = new Date(datesRange[direction > 0 ? 0 : datesRange.length - 1])
				date.setDate(date.getDate() + direction * 7)
				return date
			},
			getDateTitle: function (date) {
				return $('<div/>')
					.addClass('aura-calendar-date-picker__date')
					.append($('<div/>')
						.addClass('aura-calendar-date-picker__month')
						.html(AuraCalendar.NAMES.MONTHES[date.getMonth()])
					)
					.append($('<div/>')
						.addClass('aura-calendar-date-picker__year-week-container')
						.append($('<div/>')
							.addClass('aura-calendar-date-picker__year')
							.html(date.getFullYear())
						)
					)
			}
		},
		day: {
			getDateByDirection: function (direction) {
				var date = new Date(this.params.parent.datesRange[0])
				date.setDate(date.getDate() + direction)
				return date
			},
			getDateTitle: function (date) {
				return $('<div/>')
					.addClass('aura-calendar-date-picker__date')
					.append($('<div/>')
						.addClass('aura-calendar-date-picker__day')
						.html(date.getDate())
					)
					.append($('<div/>')
						.addClass('aura-calendar-date-picker__month')
						.html(AuraCalendar.NAMES.MONTHES_CASE[date.getMonth()])
					)
					.append($('<div/>')
						.addClass('aura-calendar-date-picker__year-week-container')
						.append($('<div/>')
							.addClass('aura-calendar-date-picker__year')
							.html(date.getFullYear())
						)
						.append($('<div/>')
							.addClass('aura-calendar-date-picker__week-day')
							.html(AuraCalendar.NAMES.DAYS[AuraCalendar.utilities.shiftSunday(date.getDay())])
						)
					)
			}
		}
	}
	return DatePicker
}())

//  ===============================================================
//  ======        ==  ====  ==        ==  =======  ==        ======
//  ======  ========  ====  ==  ========   ======  =====  =========
//  ======  ========  ====  ==  ========    =====  =====  =========
//  ======  ========  ====  ==  ========  ==  ===  =====  =========
//  ======      ====   ==   ==      ====  ===  ==  =====  =========
//  ======  =========  ==  ===  ========  ====  =  =====  =========
//  ======  =========  ==  ===  ========  =====    =====  =========
//  ======  ==========    ====  ========  ======   =====  =========
//  ======        =====  =====        ==  =======  =====  =========
//  ===============================================================

AuraCalendar.Event = (function EVENT_MODULE() {
	// Constructor
	function EventConstructor(parent, params) {
		var functionValidator = AuraCalendar.utilities.functionValidator
		if (!params) throw new Error('Event params are missed')
		this.parent = parent
		this.instanceIndex = params.instanceIndex || 0
		this.key = params.key
		this.beginDate = params.beginDate
		this.endDate = params.endDate
		this.data = params.data || {}
		this.getTitle = functionValidator(params.getTitle)
		this.getDescription = functionValidator(params.getDescription)
		this.getColor = functionValidator(params.getColor)
		this.on = {
			click: functionValidator(params.onClick),
			onInsert: functionValidator(params.onInsert),
			onRemove: functionValidator(params.onRemove)
		}
		this.eventParts = []

		this.classes = {
			event: ['aura-calendar__event'],
			title: [
				'aura-calendar__event-title'
			],
			filler: [
				'aura-calendar__event-filler',
				'aura-calendar__event-filler_' + this.parent.params.view
			]
		}
		if (AuraCalendar.utilities.isIE10orLess()) {
			this.classes.event.push('aura-calendar__event_fixed')
			this.classes.event.push('no-wrap')
		}
	}

	EventConstructor.prototype = {
		getId: function () { return this.getKey() + '-' + this.getInstanceIndex() },
		getInstanceIndex: function () { return this.instanceIndex || 0 },
		getKey: function () { return this.key },
		getBeginDate: function () { return this.beginDate },
		getEndDate: function () { return this.endDate },
		getTitle: function () { },
		getDescription: function () { },
		getColor: function () { },
		remove: function () {
			this.eventParts.map(function ($el) {
				$el.remove()
			})
			this.parent.removeEmptyRows()
		},
		render: function (params) {
			var it = this
			var cellsItem = params.cells.item
			var cellsTitle = params.cells.title
			var isBeganBefore = params.isBeganBefore
			var isEndedBefore = params.isEndedBefore
			var color = this.getColor()
			var eventParts = this.eventParts
			cellsItem.map(function (cell) {
				var $cell = $(cell)
				var $eventPart = getEventPart.call(it, color)

				$cell.html($eventPart
					.off('click')
					.click(it.parent.params.on.eventClick.bind(it.parent, it))
				)
				eventParts.push($eventPart)
			})



			if (!isBeganBefore) {
				eventParts[0]
					.find('.aura-calendar__event-filler')
					.addClass('aura-calendar__event-filler_first')
			}

			if (!isEndedBefore) {
				eventParts[eventParts.length - 1]
					.find('.aura-calendar__event-filler')
					.addClass('aura-calendar__event-filler_last')
			}

			cellsTitle.map(function (cells) {
				var $title = cells[0]
					.find('.aura-calendar__event-title')
					.html(it.getTitle())
				$title.parents('.aura-calendar__event')
					.append($('<div/>')
						.addClass('aura-calendar__event-time aura-calendar__event-time_begin')
						.html(it.beginDate.format('HH:mm') + '-' + it.endDate.format('HH:mm')))
				if (cells.length > 1) {
					$title
						.width(getTitleWidth(eventParts, cells))
						.css('z-index', 1)
				}
			})
		}
	}

	function getTitleWidth(eventParts, cells) {
		var cellWidth = Math.round(eventParts.reduce(function (acc, part) {
			return acc + part.outerWidth()
		}, 0) / eventParts.length)
		return ((cellWidth + 1) * cells.length) - 8 + 'px'
	}

	function getEventPart(color) {
		return $('<div/>')
			.addClass(this.classes.event.join(' '))
			.attr('data-key', this.getKey())
			.attr('data-instance', this.getInstanceIndex())
			.attr('title', $('<span>' + this.getTitle() + '</span>').text())

			.append($('<div/>')
				.addClass(this.classes.filler.join(' '))
				.css('background-color', color)
				.append($('<div/>')
					.addClass(this.classes.title.join(' '))
					.css('max-height', this.parent.params.eventHeight ? this.parent.params.eventHeight * 14 + 'px' : 'none')
					.addClass('text-color_' + (AuraCalendar.utilities.isColorDark(color) ? 'white' : 'black'))))
	}
	return EventConstructor
}())

//  ===========================================================================================================================================
//  ======        ==  ====  ==        ==  =======  ==        ==    ==        ==        ==       ======  =====        ====    ====       =======
//  ======  ========  ====  ==  ========   ======  =====  ======  ======  =====  ========  ====  ====    =======  ======  ==  ===  ====  ======
//  ======  ========  ====  ==  ========    =====  =====  ======  ======  =====  ========  ====  ===  ==  ======  =====  ====  ==  ====  ======
//  ======  ========  ====  ==  ========  ==  ===  =====  ======  ======  =====  ========  ===   ==  ====  =====  =====  ====  ==  ===   ======
//  ======      ====   ==   ==      ====  ===  ==  =====  ======  ======  =====      ====      ====  ====  =====  =====  ====  ==      ========
//  ======  =========  ==  ===  ========  ====  =  =====  ======  ======  =====  ========  ====  ==        =====  =====  ====  ==  ====  ======
//  ======  =========  ==  ===  ========  =====    =====  ======  ======  =====  ========  ====  ==  ====  =====  =====  ====  ==  ====  ======
//  ======  ==========    ====  ========  ======   =====  ======  ======  =====  ========  ====  ==  ====  =====  ======  ==  ===  ====  ======
//  ======        =====  =====        ==  =======  =====  =====    =====  =====        ==  ====  ==  ====  =====  =======    ====  ====  ======
//  ===========================================================================================================================================

AuraCalendar.EventIterator = (function EVENT_ITERATOR_MODULE() {
	// Constructor
	function EventIterator(parent, instanceParams, commonParams) {
		var u = AuraCalendar.utilities
		if (!instanceParams) instanceParams = {}
		if (!u.isArray(instanceParams)) instanceParams = [instanceParams]
		this.items = instanceParams.map(function (item, i) {
			return new AuraCalendar.Event(parent, {
				instanceIndex: i,
				key: item.key,
				beginDate: item.beginDate,
				endDate: item.endDate,
				data: item.data,
				getTitle: commonParams.getTitle,
				getDescription: commonParams.getDescription,
				getColor: commonParams.getColor,
				onClick: item.onClick,
				onInsert: item.onInsert,
				onRemove: item.onRemove
			})
		})
		this.length = this.items.length
	}

	EventIterator.prototype = {
		some: function (callback) {
			return this.items.some(callback)
		},
		map: function (callback) {
			return this.items.map(callback)
		},
		getKey: function () {
			return this.items[0].getKey()
		},
		remove: function () {
			this.map(function (instance) {
				instance.remove()
			})
		}
	}

	return EventIterator

}())

//  ========================================================================
//  ======  ====  ==        ==    ==  ========    ==        ==  ====  ======
//  ======  ====  =====  ======  ===  =========  ======  =====   ==   ======
//  ======  ====  =====  ======  ===  =========  ======  ======  ==  =======
//  ======  ====  =====  ======  ===  =========  ======  ======  ==  =======
//  ======  ====  =====  ======  ===  =========  ======  =======    ========
//  ======  ====  =====  ======  ===  =========  ======  ========  =========
//  ======  ====  =====  ======  ===  =========  ======  ========  =========
//  ======   ==   =====  ======  ===  =========  ======  ========  =========
//  =======      ======  =====    ==        ==    =====  ========  =========
//  ========================================================================

AuraCalendar.utilities = {
	typeOf: function (variable) {
		return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase()
	},
	isString: function (data) {
		return AuraCalendar.utilities.typeOf(data) === 'string'
	},
	isObject: function (data) {
		return AuraCalendar.utilities.typeOf(data) === 'object'
	},
	isFunction: function (data) {
		return AuraCalendar.utilities.typeOf(data) === 'function'
	},
	isArray: function (data) {
		return AuraCalendar.utilities.typeOf(data) === 'array'
	},
	isArrayFilled: function (data) {
		return AuraCalendar.utilities.isArray(data) && data.length
	},
	isDate: function (data) {
		return AuraCalendar.utilities.typeOf(data) === 'date'
	},
	isInArray: function (data, value) {
		return data.indexOf(value) !== -1
	},
	gt: function (x, y) {
		return x > y
	},
	lt: function (x, y) {
		return x < y
	},
	eq: function (x, y) {
		return x === y
	},
	isEmpty: function (data) {
		return data === undefined || data === null
	},
	identity: function (params) {
		return params
	},
	constant: function (data) {
		return function (params) {
			return data
		}
	},
	random: function (scale) {
		return Math.round(Math.random() * (scale || 1))
	},
	firstDayInMonth: function (date) {
		var date = new Date(date)
		date.setDate(1)
		return AuraCalendar.utilities.shiftSunday(date.getDay())
	},
	lastDayInMonth: function (date) {
		var u = AuraCalendar.utilities
		var date = new Date(date)
		date.setDate(u.daysInMonth(date))
		return u.shiftSunday(date.getDay())
	},
	daysInMonth: function (date) {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
	},
	shiftSunday: function (day) {
		return !day ? 6 : day - 1
	},
	datesComparator: {
		year: function (firstDate, secondDate) {
			var firstTime = new Date(
				firstDate.getFullYear(),
				firstDate.getMonth()
			)
				.getTime()
			var secondTime = new Date(
				secondDate.getFullYear(),
				secondDate.getMonth()
			)
				.getTime()

			return firstTime < secondTime ? -1
				: firstTime > secondTime ? 1 : 0

		},
		month: function (firstDate, secondDate) {
			var firstTime = new Date(
				firstDate.getFullYear(),
				firstDate.getMonth(),
				firstDate.getDate()
			)
				.getTime()
			var secondTime = new Date(
				secondDate.getFullYear(),
				secondDate.getMonth(),
				secondDate.getDate()
			)
				.getTime()

			return firstTime < secondTime
				? -1
				: firstTime > secondTime
					? 1
					: 0

		},
		week: function (firstDate, secondDate) {
			var firstTime = new Date(
				firstDate.getFullYear(),
				firstDate.getMonth(),
				firstDate.getDate(),
				firstDate.getHours()
			)
				.getTime()
			var secondTime = new Date(
				secondDate.getFullYear(),
				secondDate.getMonth(),
				secondDate.getDate(),
				secondDate.getHours()
			)
				.getTime()
			return firstTime < secondTime ? -1
				: firstTime > secondTime ? 1 : 0
		},
		day: function (firstDate, secondDate) {
			var firstTime = new Date(
				firstDate.getFullYear(),
				firstDate.getMonth(),
				firstDate.getDate(),
				firstDate.getHours()
			)
				.getTime()
			var secondTime = new Date(
				secondDate.getFullYear(),
				secondDate.getMonth(),
				secondDate.getDate(),
				secondDate.getHours()
			)
				.getTime()
			return firstTime < secondTime ? -1
				: firstTime > secondTime ? 1 : 0
		}
	},
	color: function () {
		var random = AuraCalendar.utilities.random
		return 'rgb(' + random(255) + ',' + random(255) + ',' + random(255) + ')'
	},
	get$node: function (data) {
		var u = AuraCalendar.utilities
		if (u.isString(data)) {
			var $node = $(data)
			if (!$node.length) throw new Error('$node is missed: ' + $node.selector)
			return $node
		} else if (u.isObject(data)) {
			return data
		} else {
			throw new Error('Wrong data for $node creation: ' + data)
		}

	},
	paramValidator: function (param, validator, fallbacks) {
		var value = param
		var validated = validator(value)
		if (!validated) {
			if (!fallbacks) fallbacks = []
			for (var i = 0; i < fallbacks.length; i++) {
				var fallback = fallbacks[i]
				value = fallback(param)
				validated = validator(value)
				if (validated) break
			}
			if (!validated) throw new Error('Wrong parameter "' + param + '": ' + value)
		}
		return value
	},
	functionValidator: function (handler) {
		var u = AuraCalendar.utilities
		return u.paramValidator(handler, u.isFunction, [u.constant(u.identity)])
	},
	isColorDark: function (str) {
		var l = 100
		var thresholdL = 50
		if (/^#/.test(str)) {
			var cleaned = str.replace(/[^0-9abcdef]/ig, '')
			l = AuraCalendar.utilities.rgb2hsl(
				parseInt(cleaned.substr(0, 2), 16),
				parseInt(cleaned.substr(2, 2), 16),
				parseInt(cleaned.substr(4, 2), 16)
			).l
		} else if (/^rgb/.test(str)) {
			var splits = str.replace(/[^0-9,]/g, '').split(',')
			l = AuraCalendar.utilities.rgb2hsl(
				parseInt(splits[0]),
				parseInt(splits[1]),
				parseInt(splits[2])
			).l
		} else if (/^hsl/.test(str)) {
			var l = parseInt(str.replace(/[^0-9,]/g, '').split(',')[2])
		}
		return l <= thresholdL
	},
	rgb2hsl: function (r, g, b) {
		r /= 255
		g /= 255
		b /= 255

		var cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0
		if (delta == 0) {
			h = 0
		}
		else if (cmax == r) {
			h = ((g - b) / delta) % 6
		}
		else if (cmax == g) {
			h = (b - r) / delta + 2
		}
		else {
			h = (r - g) / delta + 4
		}

		h = Math.round(h * 60)

		if (h < 0) h += 360
		l = (cmax + cmin) / 2

		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

		s = +(s * 100).toFixed(1)
		l = +(l * 100).toFixed(1)

		return { h: h, s: s, l: l }
	},
	isIE10orLess: function () {
		var ua = window.navigator.userAgent
		var msie = ua.indexOf('MSIE ')
		if (msie > 0) {
			if ((parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)) < 11) return true
		}
		return false
	},
	defaultEventColor: '#8bc34a'
}

export default AuraCalendar