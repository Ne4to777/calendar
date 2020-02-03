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
		var defaultViews = ['year', 'month', 'week']
		var views = params.views || defaultViews
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
		buildMainView.call(this)
		initDatePicker.call(this)
		initGrid.call(this)
	}
	AuraCalendar.prototype = {
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
		var hasWeekView = this.hasView('week')
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
		this.$.buttons.today = $('<div/>')
			.addClass('aura-calendar__button aura-calendar__button_today')
			.text('Текущая дата')
			.off('click')
			.click(this.setState.bind(this, { date: new Date }))
		this.$.buttons.container
			.append(this.$.buttons.year)
			.append(hasWeekView ? this.$.buttons.month : undefined)
			.append(this.$.buttons.today)
		this.$.grid = $('<div/>')
			.addClass('aura-calendar__grid')
		this.$.wrapper = $('<div/>').addClass('aura-calendar')
			.append(this.$.datePicker)
			.append(this.$.buttons.container)
			.append(this.$.grid)
		updateYearButton.call(this)
		if (hasWeekView) updateMonthButton.call(this)
		updateTodayButton.call(this)
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
		var it = this
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
						if (view) {
							state.view = view
							updateYearButton.call(it)
							updateMonthButton.call(it)
						}
						if (date) {
							state.date = date
							updateTodayButton.call(it)
						}
						it.datePicker.stateChangeHandler()
						it.grid.stateChangeHandler()
					}
					it.params.on.stateChanged.call(it, it.state)
				}
			}
		})
	}
	function updateYearButton() {
		this.$.buttons.year[this.state.view === 'year' ? 'hide' : 'show']()
	}
	function updateMonthButton() {
		this.$.buttons.month[this.state.view === 'week' ? 'show' : 'hide']()
	}
	function updateTodayButton() {
		var now = new Date()
		this.$.buttons.today[
			this.state.date.getMonth() === now.getMonth()
				&& this.state.date.getFullYear() === now.getFullYear()
				? 'hide'
				: 'show']()
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
	return AuraCalendar
}())

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
		NAMES: {
			VIEWS: ['year', 'month'],
			DAYS: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
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
			HOURS: [
				'00', '01', '02', '03', '04', '05',
				'06', '07', '08', '09', '10', '11',
				'12', '13', '14', '15', '16', '17',
				'18', '19', '20', '21', '22', '23'
			]
		},
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
			var firstDateInView = this.datesRange[0]
			var lastDateInView = this.datesRange.slice(-1)[0]
			lastDateInView.setHours(23)
			lastDateInView.setMinutes(59)
			lastDateInView.setSeconds(59)

			var datesComparator = AuraCalendar.utilities.datesComparator[it.state.view]

			items.map(function (iterator) {
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
						cells: getCellsToInsert.call(it, firstCellDate, lastCellDate),
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
	function getCellsToInsert(firstCellDate, lastCellDate) {
		var getter
		switch (this.state.view) {
			case 'year':
				getter = getYearCellsToInsert
				break
			case 'month':
				getter = getMonthCellsToInsert
				break;
			case 'week':
				getter = getWeekCellsToInsert
				break
		}
		return getter.call(this, firstCellDate, lastCellDate)
	}

	function buildMainView() {
		var tableBuilder
		var vector = []
		var u = AuraCalendar.utilities
		var date = this.state.date
		switch (this.state.view) {
			case 'year':
				var year = date.getFullYear()
				vector = this.NAMES.MONTHES.map(function (name, i) {
					return new Date(year, i, 1)
				})
				tableBuilder = buildYear$table
				break
			case 'month':
				var firstDayInView = -u.firstDayInMonth(date)
				var lastDayInView = 6 - u.lastDayInMonth(date) + u.daysInMonth(date)
				for (var j = firstDayInView, i = 0; j <= lastDayInView; j++ , i++) {
					var actualDate = new Date(date)
					actualDate.setDate(j)
					vector.push(actualDate)
				}
				tableBuilder = buildMonth$table
				break
			case 'week':
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
				tableBuilder = buildWeek$table
				break
		}
		this.datesRange = vector
		this.$.table = tableBuilder.call(this)
		this.$.wrapper.html(this.$.table)
	}

	function getDateQuery(params) {
		if (!params) params = {}
		var yearQuery = params.year === undefined ? '' : '[data-year="' + params.year + '"]'
		var monthQuery = params.month === undefined ? '' : '[data-month="' + params.month + '"]'
		var dayQuery = params.day === undefined ? '' : '[data-day="' + params.day + '"]'
		var hourQuery = params.hour === undefined ? '' : '[data-hour="' + params.hour + '"]'
		var elQuery = params.el || ''
		return elQuery + yearQuery + monthQuery + dayQuery + hourQuery
	}


	// YEAR
	function getYearCellsToInsert(firstCellDate, lastCellDate) {
		var it = this
		var $table = this.$.table
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
			var new$row = getYear$bodyRow.call(it)
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

	function buildYear$table() {
		var $table = getYear$table.call(this)
		// var now = new Date()

		// $table.find(getDateQuery({
		// 	year: now.getFullYear(),
		// 	month: now.getMonth(),
		// 	day: now.getDate(),
		// 	el: '.aura-calendar__body-cell_head'
		// })).addClass('aura-calendar__body-cell_active')
		return $table
	}

	function getYear$table() {
		return $('<table/>')
			.addClass('aura-calendar__table')
			.append(getYear$head.call(this), getYear$bodies.call(this))
	}

	function getYear$head() {
		var it = this
		return $('<thead/>')
			.addClass('aura-calendar__head')
			.append(this.NAMES.MONTHES.reduce(function ($acc, name, i) {
				$('<th/>')
					.addClass('aura-calendar__head-cell aura-calendar__head-cell_year')
					.attr('data-month', i)
					.text(name)
					.appendTo($acc)
				return $acc
			}, $('<tr/>')
				.addClass('aura-calendar__head-row aura-calendar__head-row_year'))
				.off('click').click(function (e) {
					var date = new Date(it.state.date.getFullYear(), $(e.target).data('month'), 1)
					var view = 'month'
					it.setState({ date: date, view: view })
				}))
	}

	function getYear$bodies() {
		return [getYear$body.call(this)]
	}

	function getYear$body() {
		return $('<tbody/>')
			.addClass('aura-calendar__body aura-calendar__body_year')
			.html(getYear$bodyRow.call(this))
	}

	function getYear$bodyRow() {
		return $('<tr/>')
			.addClass('aura-calendar__body-row_item aura-calendar__body-row_year')
			.html(this.NAMES.MONTHES.reduce(function (acc, el, i) {
				return acc.concat($('<td/>')
					.addClass('aura-calendar__body-cell_year  aura-calendar__body-cell_item')
					.attr('data-month', i))
			}, []))
	}



	// MONTH

	function getMonthCellsToInsert(firstCellDate, lastCellDate) {
		var rowIsFull, dateIsOver
		var datesComparator = AuraCalendar.utilities.datesComparator.month
		var data = {
			item: [],
			title: []
		}
		var current$body = this.$.table.find(getDateQuery({
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
					var cellDate = getMonthDateFrom$cell(current$cell)
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
				current$row = getMonth$bodyRow(getMonthDateFrom$cell(current$body
					.find('.aura-calendar__body-cell_item').first()))
					.appendTo(current$body)
			}

			current$cell = current$row.find('.aura-calendar__body-cell_item').first()

			dateIsOver = false
			var titles = []
			while (current$cell.length) {
				var cellDate = getMonthDateFrom$cell(current$cell)
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

	function buildMonth$table() {
		var it = this
		var $table = getMonth$table.call(this)
		var now = new Date()
		$table.find(getDateQuery({
			year: now.getFullYear(),
			month: now.getMonth(),
			day: now.getDate(),
			el: '.aura-calendar__body-cell_head'
		}))
			.addClass('aura-calendar__body-cell_active')
		if (this.params.parent.hasView('week')) {
			$table.find('.aura-calendar__body-row_head')
				.addClass('aura-calendar__body-row_head_clickable')
				.off('click')
				.click(function (e) {
					var $firstCell = $(this).find('.aura-calendar__body-cell_month').first()
					var date = new Date($firstCell.attr('data-year'), $firstCell.attr('data-month'), $firstCell.attr('data-day'))
					it.setState({
						view: 'week',
						date: date
					})
				})

		}
		return $table
	}

	function getMonth$table() {
		return $('<table/>')
			.addClass('aura-calendar__table')
			.append(getMonth$head.call(this), getMonth$bodies.call(this))
	}

	function getMonth$head() {
		return $('<thead/>')
			.addClass('aura-calendar__head')
			.html(this.NAMES.DAYS.reduce(function ($acc, name, i) {
				return $acc.append($('<th/>')
					.addClass('aura-calendar__head-cell')
					.attr('data-day', i + 1)
					.html(name))
			}, $('<tr/>').addClass('aura-calendar__head-row')))
	}

	function getMonth$bodies() {
		var it = this
		return this.datesRange.reduce(function (acc, el, i) {
			if (!(i % 7)) acc.push(getMonth$body.call(it, el))
			return acc
		}, [])
	}

	function getMonth$body(date) {
		return $('<tbody/>')
			.addClass('aura-calendar__body aura-calendar__body_month')
			.html([getMonth$bodyHead.call(this, date), getMonth$bodyRow.call(this, date)])
	}

	function getMonth$bodyHead(date) {
		var tds = []
		var currentDate = new Date(date)
		for (var i = 0; i < 7; i++) {
			var mutedClass = currentDate.getMonth() === this.state.date.getMonth()
				&& currentDate.getFullYear() === this.state.date.getFullYear() ? '' : ' aura-calendar__body-cell_muted'
			tds.push(getHead$bodyCell(currentDate, mutedClass))
			currentDate.setDate(currentDate.getDate() + 1)
		}

		return $('<tr/>')
			.addClass('aura-calendar__body-row_head')
			.html(tds)
	}

	function getHead$bodyCell(date, mutedClass) {
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
	}

	function getMonth$bodyRow(date) {
		var tds = []
		var currentDate = new Date(date)
		for (var i = 0; i < 7; i++) {
			tds.push(getMonth$bodyCell(currentDate))
			currentDate.setDate(currentDate.getDate() + 1)
		}
		return $('<tr/>')
			.addClass('aura-calendar__body-row_item aura-calendar__body-row_month')
			.html(tds)
	}

	function getMonth$bodyCell(date) {
		return $('<td/>')
			.addClass('aura-calendar__body-cell_month  aura-calendar__body-cell_item')
			.attr('data-year', date.getFullYear())
			.attr('data-month', date.getMonth())
			.attr('data-day', date.getDate())
	}

	function getMonthDateFrom$cell($cell) {
		return new Date(
			$cell.attr('data-year'),
			$cell.attr('data-month'),
			$cell.attr('data-day')
		)
	}

	// WEEK

	function getWeekCellsToInsert(firstCellDate, lastCellDate) {
		var rowIsFull, dateIsOver
		var datesComparator = AuraCalendar.utilities.datesComparator.week
		var data = {
			item: [],
			title: []
		}
		var current$body = this.$.table.find(getDateQuery({
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
					var cellDate = getWeekDateFrom$cell(current$cell)
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
				current$row = getWeek$bodyRow.call(this, getWeekDateFrom$cell(current$body
					.find('.aura-calendar__body-cell_item').first()))
					.appendTo(current$body)
			}

			current$cell = current$row.find('.aura-calendar__body-cell_item').first()

			dateIsOver = false
			var titles = []
			while (current$cell.length) {
				var cellDate = getWeekDateFrom$cell(current$cell)

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

	function buildWeek$table() {
		var $table = getWeek$table.call(this)
		var now = new Date()
		$table.find(getDateQuery({
			year: now.getFullYear(),
			month: now.getMonth(),
			day: now.getDate(),
			el: '.aura-calendar__body-cell_head'
		}))
			.addClass('aura-calendar__body-cell_active')
		return $table
	}

	function getWeek$table() {
		return $('<table/>')
			.addClass('aura-calendar__table')
			.append(getWeek$head.call(this), getWeek$bodies.call(this))
	}

	function getWeek$head() {
		return $('<thead/>')
			.addClass('aura-calendar__head')
			.html(this.NAMES.HOURS.reduce(function ($acc, name, i) {
				return $acc.append($('<th/>')
					.addClass('aura-calendar__head-cell')
					.attr('data-day', i + 1)
					.html(name))
			}, $('<tr/>')
				.addClass('aura-calendar__head-row')
				.html($('<th/>')
					.addClass('aura-calendar__head-cell'))))
	}

	function getWeek$bodies() {
		var bodies = []
		for (var i = 0; i < 7; i++) {
			bodies.push(getWeek$body.call(this, this.datesRange[i]))
		}
		return bodies
	}

	function getWeek$body(date) {
		return $('<tbody/>')
			.addClass('aura-calendar__body aura-calendar__body_week')
			.html([getWeek$headRow.call(this, date), getWeek$bodyRow.call(this, date)])
	}

	function getWeek$headRow(date) {
		var day = AuraCalendar.utilities.shiftSunday(date.getDay())
		var currentDate = new Date(date)
		var mutedClass = currentDate.getFullYear() === this.state.date.getFullYear()
			&& currentDate.getMonth() === this.state.date.getMonth() ? '' : ' aura-calendar__body-cell_muted'
		var tds = [$('<td/>')
			.addClass('aura-calendar__body-cell_head_week aura-calendar__body-cell_head' + mutedClass)
			.attr('data-week-day', day)
			.html($('<div/>')
				.addClass('aura-calendar__body-cell_week-name')
				.html(this.NAMES.DAYS[day]))
			.append($('<div/>')
				.addClass('aura-calendar__body-cell_week-day')
				.html(currentDate.getDate()))]
		for (var i = 0; i < 24; i++) {
			tds.push(getWeek$headCell(currentDate))
			currentDate.setHours(currentDate.getHours() + 1)
		}

		return $('<tr/>')
			.addClass('aura-calendar__body-row_head aura-calendar__body-row_head_week')
			.html(tds)
	}

	function getWeek$bodyRow(date) {
		var day = AuraCalendar.utilities.shiftSunday(date.getDay())
		var tds = [$('<td/>')
			.addClass('aura-calendar__body-cell_week-empty aura-calendar__body-cell_week')
			.attr('data-week-day', day)]
		var currentDate = new Date(date)
		for (var i = 0; i < 24; i++) {
			tds.push(getWeek$bodyCell(currentDate))
			currentDate.setHours(currentDate.getHours() + 1)
		}

		return $('<tr/>')
			.addClass('aura-calendar__body-row_item aura-calendar__body-row_week')
			.html(tds)
	}

	function getWeek$headCell(date) {
		return $('<td/>')
			.addClass('aura-calendar__body-cell_head_week aura-calendar__body-cell_head')
			.attr('data-year', date.getFullYear())
			.attr('data-month', date.getMonth())
			.attr('data-day', date.getDate())
			.attr('data-hour', date.getHours())
	}

	function getWeek$bodyCell(date) {
		return $('<td/>')
			.addClass('aura-calendar__body-cell_week  aura-calendar__body-cell_item')
			.attr('data-year', date.getFullYear())
			.attr('data-month', date.getMonth())
			.attr('data-day', date.getDate())
			.attr('data-hour', date.getHours())
	}

	function getWeekDateFrom$cell($cell) {
		return new Date(
			$cell.attr('data-year'),
			$cell.attr('data-month'),
			$cell.attr('data-day'),
			$cell.attr('data-hour')
		)
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
		formats: {
			year: 'yyyy',
			month: 'MM.yyyy',
			week: 'MM.yyyy'
		},
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
			this.$.date.html(this.state.date.format(this.formats[this.state.view]))
		}
	}
	//Internal
	function buildMainView() {
		this.$.date = $('<div/>')
			.addClass('aura-calendar-date-picker__date')
			.html(this.state.date.format(this.formats[this.state.view]))
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
		var date = new Date(this.state.date)
		switch (this.state.view) {
			case 'month': date.setMonth(date.getMonth() + direction); break
			case 'year': date.setFullYear(date.getFullYear() + direction); break
			case 'week': date.setDate(date.getDate() + direction * 7); break
		}
		this.setState({ date: date })
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
		AuraCalendar.utilities.isIE10orLess() && this.classes.event.push('aura-calendar__event_fixed')
	}

	EventConstructor.prototype = {
		HEIGHTS: {
			year: 14,
			month: 14,
			week: 14
		},
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
				var title = it.getTitle()
				$title
					.attr('title', title)
					.html(title)
				if (cells.length > 1) {
					$title.width((100 * cells.length + 10) + '%')
				}
			})
		}
	}


	function getEventPart(color) {
		return $('<div/>')
			.addClass(this.classes.event.join(' '))
			.attr('data-key', this.getKey())
			.attr('data-instance', this.getInstanceIndex())
			.append($('<div/>')
				.addClass(this.classes.filler.join(' '))
				.css('background-color', color)
				.append($('<div/>')
					.addClass(this.classes.title.join(' '))
					.css('max-height', this.parent.params.eventHeight ? this.parent.params.eventHeight * this.HEIGHTS[this.parent.state.view] + 'px' : 'none')
					.addClass('text-color_' + (AuraCalendar.utilities.isColorDark(color) ? 'white' : 'black'))))
	}
	return EventConstructor
}())

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
		date.setDate(0)
		var day = date.getDay()
		return AuraCalendar.utilities.shiftSunday(day)
	},
	lastDayInMonth: function (date) {
		var u = AuraCalendar.utilities
		var date = new Date(date)
		date.setDate(u.daysInMonth(date))
		var day = date.getDay()
		return u.shiftSunday(day)
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

			return firstTime < secondTime ? -1
				: firstTime > secondTime ? 1 : 0

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