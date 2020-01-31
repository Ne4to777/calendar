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

		this.params = {
			container: params.container || '.calendar',
			view: params.view || 'year',
			date: params.date || new Date(),
			fixedRowHeight: params.fixedRowHeight || false,
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
		insertEvent: function (data) {
			var u = AuraCalendar.utilities
			var items
			if (u.isArray(data)) {
				items = data.map(getEventIteratorInstance.bind(this))
			} else {
				items = [getEventIteratorInstance.call(this, data)]
			}
			this.grid.insertItem(items)
		},
		removeEvent: function (instance) { this.grid.removeItem(instance) },
		setState: function (state) {
			this.state = state
		},
	}

	// Internal
	function buildMainView() {
		this.$.datePicker = $('<div/>')
			.addClass('aura-calendar__date-picker')
		this.$.buttons.container = $('<div/>')
			.addClass('aura-calendar__buttons')
		this.$.buttons.year = $('<div/>')
			.addClass('aura-calendar__button aura-calendar__button_year')
			.text('Отобразить год')
			.off('click')
			.click(this.setState.bind(this, { view: 'year' }))
		this.$.buttons.today = $('<div/>')
			.addClass('aura-calendar__button aura-calendar__button_today')
			.text('Текущая дата')
			.off('click')
			.click(this.setState.bind(this, { date: new Date }))
		this.$.buttons.container
			.append(this.$.buttons.year)
			.append(this.$.buttons.today)
		this.$.grid = $('<div/>')
			.addClass('aura-calendar__grid')
		this.$.wrapper = $('<div/>').addClass('aura-calendar')
			.append(this.$.datePicker)
			.append(this.$.buttons.container)
			.append(this.$.grid)
		updateYearButton.call(this)
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
				it.params.on.eventClick.call(it, event)
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
	function updateTodayButton() {
		var now = new Date()
		this.$.buttons.today[this.state.date.getMonth() === now.getMonth() && this.state.date.getFullYear() === now.getFullYear() ? 'hide' : 'show']()
	}
	function getEventIteratorInstance(item) {
		return item instanceof AuraCalendar.EventIterator
			? item
			: new AuraCalendar.EventIterator(item, {
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
		this.items = []
		this.isIE10orLess = u.isIE10orLess()
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
			MONTHES: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
		},
		setState: function (state) {
			this.params.parent.setState(state)
		},
		render: function (params) {
			if (!params) params = {}
			if (params.date || params.view) this.setState(params)

			this.$.container.html(this.$.wrapper)
			this.params.on.render.call(this, params)
		},
		destroy: function (params) {
			this.params.on.destroy.call(this, params)
			this.$.container.remove(this.$.wrapper)
		},
		insertItem: function (items) {
			var it = this
			var u = AuraCalendar.utilities
			var firstDateInView = this.datesRange[0]
			var lastDateInView = this.datesRange.slice(-1)[0]
			var datesComparator = u.datesComparator[it.state.view]
			items.map(function (iterator) {
				iterator.map(function (instance) {
					var instanceIndex = instance.getInstanceIndex()
					var key = instance.getKey()
					var id = instance.getId()

					var beginDate = instance.getBeginDate()
					var endDate = instance.getEndDate()

					if (!beginDate || !endDate) return

					var viewConfig = [true, true]

					if (it.itemsMap[id]) it.removeItem(instance)

					if (datesComparator(beginDate, lastDateInView) > 0 || datesComparator(endDate, firstDateInView) < 0) return
					if (datesComparator(beginDate, firstDateInView) < 0) viewConfig[0] = false
					if (datesComparator(endDate, lastDateInView) > 0) viewConfig[1] = false
					var firstCellDate = viewConfig[0] ? beginDate : firstDateInView
					var lastCellDate = viewConfig[1] ? endDate : lastDateInView

					switch (it.state.view) {
						case 'month':
							insertMonthItem.call(it, instance, firstCellDate, lastCellDate)
							break
						case 'year':
							insertYearItem.call(it, instance, firstCellDate, lastCellDate)
							break
					}
					insertItem.call(it, instance)

					if (viewConfig[0] || viewConfig[1]) {
						var $items = it.$.table
							.find('[data-key="' + key + '"][data-instance="' + instanceIndex + '"] .aura-calendar__event-filler')
					}
					if (viewConfig[0]) {
						$items
							.first()
							.addClass('aura-calendar__event-filler_first')
					}

					if (viewConfig[1]) {
						$items
							.last()
							.addClass('aura-calendar__event-filler_last')
					}

					it.$.table
						.find('[data-key="' + key + '"][data-instance="' + instanceIndex + '"]')
						.off('click')
						.click(it.params.on.itemClick.bind(it, instance))
				})
			})
		},
		removeItem: function (item) {
			var items
			if (!AuraCalendar.utilities.isArray(items)) {
				items = [item]
			}
			for (var i = 0; i < items.length; i++) {
				var item = items[i]
				var key = item.getKey()
				var instanceIndex = item.getInstanceIndex()
				var $itemCells = this.$.table.find('[data-key="' + key + '"][data-instance="' + instanceIndex + '"]')
				var $rows = $itemCells.parents('.aura-calendar__body-row_item')
				if ($itemCells.length) {
					$itemCells.remove()
					removeItem.call(this, item)
					$rows.each(function (i, row) {
						var $row = $(row)
						if (!$row.find('.aura-calendar__event-filler').length) {
							$row.remove()
						}
					})
					item.params.on.remove && item.params.on.remove.call(this, this.state)
				}
			}
		},
		clear: function () {
			for (var key in this.itemsMap) {
				this.removeItem(this.itemsMap[key])
			}
			clearItems.call(this)
			this.params.on.clear.call(this)
		},
		stateChangeHandler: function () {
			clearItems.call(this)
			buildMainView.call(this)
		}
	}
	// Internal

	function buildMainView() {
		var vector = []
		var u = AuraCalendar.utilities
		var date = this.state.date
		switch (this.state.view) {
			case 'month':
				var firstDayInView = -u.firstDayInMonth(date)
				var lastDayInView = 6 - u.lastDayInMonth(date) + u.daysInMonth(date)
				for (var j = firstDayInView, i = 0; j <= lastDayInView; j++ , i++) {
					var actualDate = new Date(date)
					actualDate.setDate(j)
					vector.push(actualDate)
				}
				this.datesRange = vector
				this.$.table = buildMonth$table.call(this)
				break
			case 'year':
				var year = date.getFullYear()
				vector = this.NAMES.MONTHES.map(function (name, i) {
					return new Date(year, i, 1)
				})
				this.datesRange = vector
				this.$.table = buildYear$table.call(this)
		}
		this.$.wrapper.html(this.$.table)
	}

	function insertItem(item) {
		this.itemsMap[item.getId()] = item
		this.items.push(item)
	}

	function removeItem(item) {
		var index
		var id = item.getId()
		delete this.itemsMap[id]
		this.items.some(function (item, i) {
			if (id === item.getId()) index = i
		})
		this.items.splice(index, 1)
	}

	function clearItems() {
		this.itemsMap = {}
		this.items = []
	}

	function getDateQuery(params) {
		if (!params) params = {}
		var yearQuery = params.year === undefined ? '' : '[data-year="' + params.year + '"]'
		var monthQuery = params.month === undefined ? '' : '[data-month="' + params.month + '"]'
		var dayQuery = params.day === undefined ? '' : '[data-day="' + params.day + '"]'
		var elQuery = params.el || ''
		return elQuery + yearQuery + monthQuery + dayQuery
	}


	// YEAR

	function insertYearItem(instance, firstCellDate, lastCellDate) {
		var $rowToInsert
		var it = this
		var u = AuraCalendar.utilities
		var $headCellsToInsert = getYear$headCellsToInsert.call(this, firstCellDate, lastCellDate)
		var key = instance.getKey()
		var instanceIndex = instance.getInstanceIndex()

		var color = instance.getColor() || u.defaultEventColor
		var $body = this.$.table.find('.aura-calendar__body_year')
		var firstMonth = $headCellsToInsert.first().data('month')
		var lastMonth = $headCellsToInsert.last().data('month')
		$headCellsToInsert.each(function (i, headCell) {
			var $headCell = $(headCell)
			var month = $headCell.data('month')

			if (!$rowToInsert) {

				$body.find('.aura-calendar__body-row_item').each(function (i, row) {
					var $row = $(row)
					$rowToInsert = $row

					$row.find('.aura-calendar__body-cell_item').each(function (i, cell) {
						var $cell = $(cell)

						var month = $cell.data('month')
						if (month < firstMonth || month > lastMonth) return true

						if ($cell.children().length) {
							$rowToInsert = null
							return false
						}

					})
					if ($rowToInsert) return false
				})

				if (!$rowToInsert) {
					$rowToInsert = getYear$bodyRow.call(it)
					$body.append($rowToInsert)
				}
			}

			var titleClasses = ['aura-calendar__event-title', 'aura-calendar__event-title_fixed', 'text-color_' + (u.isColorDark(color) ? 'white' : 'black')]

			var eventClasses = ['aura-calendar__event']
			it.state.fixedRowHeight && eventClasses.push('aura-calendar__event_fixed')
			it.isIE10orLess && eventClasses.push('height_auto')
			var fillerClasses = ['aura-calendar__event-filler', 'aura-calendar__event-filler_year']
			it.isIE10orLess && fillerClasses.push('position_relative')


			$('<div/>')
				.addClass(eventClasses.join(' '))
				.attr('data-key', key)
				.attr('data-instance', instanceIndex)
				.append($('<div/>')
					.addClass(fillerClasses.join(' '))
					.css('background-color', color)
					.append($('<div/>')
						.addClass(titleClasses.join(' '))))
				.appendTo($rowToInsert
					.find(getDateQuery({
						el: '.aura-calendar__body-cell_item',
						month: month,
					})))
		})

		var $eventParts = $body.find('[data-key="' + key + '"][data-instance="' + instanceIndex + '"]')
		var $title = $eventParts.first().find('.aura-calendar__event-title')
		$title.html(instance.getTitle())
		$title.addClass('padding-left_10px')
		$title.parent().css('position', 'relative')
		if ($eventParts.length > 1) {
			$title.width((100 * $eventParts.length - 17) + '%')
			$title.css('z-index', 2)
		}
	}

	function getYear$headCellsToInsert(firstCellDate, lastCellDate) {
		var nodes = []
		var currentDate = new Date(firstCellDate)
		currentDate.setDate(1)

		while (AuraCalendar.utilities.datesComparator.year(currentDate, lastCellDate) < 1) {
			nodes.push(this.$.table.find(getDateQuery({
				el: '.aura-calendar__head-cell',
				month: currentDate.getMonth()
			})))
			currentDate.setMonth(currentDate.getMonth() + 1)
		}
		return $(nodes)
	}

	function buildYear$table() {
		var $table = getYear$table.call(this)
		var now = new Date()

		// $table.find(getDateQuery({
		// 	year: now.getFullYear(),
		// 	month: now.getMonth(),
		// 	day: now.getDate(),
		// 	el: '.aura-calendar__body-cell_head'
		// })).addClass('aura-calendar__body-cell_active')
		return $table
	}

	function getYear$table() {
		var $table = $('<table class="aura-calendar__table"></table>')
		var $head = getYear$head.call(this)
		var $bodies = getYear$bodies.call(this)

		$table.append($head, $bodies)
		return $table
	}

	function getYear$head() {
		var it = this
		var $head = $('<thead class="aura-calendar__head"></thead>')
		var $headRow = this.NAMES.MONTHES.reduce(function ($acc, name, i) {
			$acc.append('<th class="aura-calendar__head-cell aura-calendar__head-cell_year" data-month="' + i + '">' + name + '</th>')
			return $acc
		}, $('<tr class="aura-calendar__head-row aura-calendar__head-row_year"></tr>'))

		$head.html($headRow)
		$headRow.off('click').click(function (e) {
			var date = new Date(it.state.date.getFullYear(), $(e.target).data('month'), 1)
			var view = 'month'
			it.setState({ date: date, view: view })
		})
		return $head
	}

	function getYear$bodies() {
		var $bodies = []
		$bodies.push(getYear$body.call(this))
		return $bodies
	}

	function getYear$body() {
		var $body = $('<tbody class="aura-calendar__body aura-calendar__body_year"></tbody>')
		var $row = getYear$bodyRow.call(this)
		$body.html($row)
		return $body
	}

	function getYear$bodyRow() {
		var $row = $('<tr class="aura-calendar__body-row_item aura-calendar__body-row_year"></tr>')
		var $tds = []
		for (var i = 0; i < 12; i++) {
			var date = this.datesRange[i]
			$tds.push($('\
				<td \
					class="aura-calendar__body-cell_year  aura-calendar__body-cell_item" \
					data-month="' + date.getMonth() + '" \
				></td>'))
		}
		$row.html($tds)
		return $row
	}



	// MONTH

	function insertMonthItem(item, firstCellDate, lastCellDate) {
		var $rowToInsert, currentWeek
		var it = this
		var $headCellsToInsert = getMonth$headCellsToInsert.call(this, firstCellDate, lastCellDate)
		var color = item.getColor() || AuraCalendar.utilities.defaultEventColor
		var instanceIndex = item.getInstanceIndex()
		var key = item.getKey()
		var datesComparator = AuraCalendar.utilities.datesComparator.month
		$headCellsToInsert.each(function (i, headCell) {
			var $headCell = $(headCell)
			var $body = $headCell.parents('.aura-calendar__body')
			var week = $body.data('week')
			var year = $headCell.data('year')
			var month = $headCell.data('month')
			var day = $headCell.data('day')
			if (currentWeek !== week) {
				currentWeek = week
				$rowToInsert = null
				$body.find('.aura-calendar__body-row_item').each(function (i, row) {
					var $row = $(row)
					$rowToInsert = $row
					$row.find('.aura-calendar__body-cell_item').each(function (i, cell) {
						var $cell = $(cell)
						var cellDate = new Date($cell.data('year'), $cell.data('month'), $cell.data('day'))
						if (datesComparator(cellDate, item.getBeginDate()) < 0 || datesComparator(cellDate, item.getEndDate()) > 0) return true
						if ($cell.children().length) {
							$rowToInsert = null
							return false
						}

					})

					if ($rowToInsert) return false
				})

				if (!$rowToInsert) {
					$rowToInsert = getMonth$bodyRow.call(it, week)
					$body.append($rowToInsert)
				}
			}

			var titleClasses = ['aura-calendar__event-title', 'text-color_' + (AuraCalendar.utilities.isColorDark(color) ? 'white' : 'black')]

			if (it.isIE10orLess || it.state.fixedRowHeight) titleClasses.push('aura-calendar__event-title_fixed')

			var eventClasses = ['aura-calendar__event']
			it.state.fixedRowHeight && eventClasses.push('aura-calendar__event_fixed')
			it.isIE10orLess && eventClasses.push('height_auto')

			$rowToInsert
				.find(getDateQuery({
					el: '.aura-calendar__body-cell_item',
					year: year,
					month: month,
					day: day
				}))
				.html('\
					<div class="'+ eventClasses.join(' ') + '" data-key="' + key + '" data-instance="' + instanceIndex + '">\
						<div class="aura-calendar__event-filler'+ (it.isIE10orLess ? ' position_relative' : '') + '" style="background-color:' + color + '">\
							<div class="'+ titleClasses.join(' ') + '"></div>\
						</div>\
					</div>'
				)
		})

		this.$.table.find('.aura-calendar__body-row_item').each(function (i, row) {
			var $events = $(row).find('[data-key="' + key + '"][data-instance="' + instanceIndex + '"]')
			var $title = $events.first().find('.aura-calendar__event-title')

			$title.html(item.getTitle())
			$title.addClass('padding-left_10px')
			$title.parent().css('position', 'relative')
			if ($events.length > 1) {

				$title.width((100 * $events.length - 17) + '%')
				$title.css('z-index', 2)
			}
		})
	}

	function getMonth$headCellsToInsert(firstCellDate, lastCellDate) {
		var $nodes = []
		var currentDate = new Date(firstCellDate)
		var datesComparator = AuraCalendar.utilities.datesComparator.month
		while (datesComparator(currentDate, lastCellDate) < 1) {
			$nodes.push(this.$.table.find(getDateQuery({
				el: '.aura-calendar__body-cell_head',
				year: currentDate.getFullYear(),
				month: currentDate.getMonth(),
				day: currentDate.getDate()
			})))
			currentDate.setDate(currentDate.getDate() + 1)
		}
		return $($nodes)
	}

	function buildMonth$table() {
		var $table = getMonth$table.call(this)
		var now = new Date()

		$table.find(getDateQuery({
			year: now.getFullYear(),
			month: now.getMonth(),
			day: now.getDate(),
			el: '.aura-calendar__body-cell_head'
		})).addClass('aura-calendar__body-cell_active')
		return $table
	}

	function getMonth$table() {
		var $table = $('<table class="aura-calendar__table"></table>')
		var $head = getMonth$head.call(this)
		var $bodies = getMonth$bodies.call(this)

		$table.append($head, $bodies)
		return $table
	}

	function getMonth$head() {
		var $head = $('<thead class="aura-calendar__head"></thead>')
		var $headRow = this.NAMES.DAYS.reduce(function ($acc, name, i) {
			$acc.append('<th class="aura-calendar__head-cell" data-day="' + (i + 1) + '">' + name + '</th>')
			return $acc
		}, $('<tr class="aura-calendar__head-row"></tr>'))

		$head.html($headRow)
		return $head
	}

	function getMonth$bodies() {
		var $bodies = []
		for (var j = 0; j < this.datesRange.length; j++) {
			if (!(j % 7)) {
				$bodies.push(getMonth$body.call(this, j / 7))
			}
		}
		return $bodies
	}

	function getMonth$body(week) {
		var $body = $('<tbody class="aura-calendar__body aura-calendar__body_month" data-week="' + week + '"></tbody>')
		var $head = getMonth$bodyHead.call(this, week)
		var $row = getMonth$bodyRow.call(this, week)
		$body.html([$head, $row])
		return $body
	}

	function getMonth$bodyHead(week) {
		var $head = $('<tr class="aura-calendar__body-row_head" data-week="' + week + '"></tr>')
		var $tds = []
		var beginIndex = week * 7

		for (var i = 0; i < 7; i++) {
			var date = this.datesRange[beginIndex++]
			var day = date.getDate()
			var mutedClass = ' '
			if (date.getMonth() !== this.state.date.getMonth()) {
				mutedClass = ' aura-calendar__body-cell_muted'
			}
			$tds.push($('\
				<td \
					class="aura-calendar__body-cell_month  aura-calendar__body-cell_head'+ mutedClass + '" \
					data-year="' + date.getFullYear() + '" \
					data-month="' + date.getMonth() + '" \
					data-day="' + day + '" \
				>\
					<div class="aura-calendar__day-number">\
						'+ day + '\
					</div>\
				</td>'))
		}
		$head.html($tds)
		return $head
	}

	function getMonth$bodyRow(week) {
		var $row = $('<tr class="aura-calendar__body-row_item aura-calendar__body-row_month" data-week="' + week + '"></tr>')
		var $tds = []
		var beginIndex = week * 7
		for (var i = 0; i < 7; i++) {
			var date = this.datesRange[beginIndex++]
			var day = date.getDate()
			$tds.push($('\
				<td \
					class="aura-calendar__body-cell_month  aura-calendar__body-cell_item" \
					data-year="' + date.getFullYear() + '" \
					data-month="' + date.getMonth() + '" \
					data-day="' + day + '" \
				>\
				</td>'))
		}
		$row.html($tds)
		return $row
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
			month: 'MM.yyyy'
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
		},
		previous: function () {
			move.call(this, -1)
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
	function EventConstructor(params) {
		var functionValidator = AuraCalendar.utilities.functionValidator
		if (!params) throw new Error('Event params are missed')
		this.instanceIndex = params.instanceIndex || 0
		this.key = params.key
		this.beginDate = params.beginDate
		this.endDate = params.endDate
		this.data = params.data
		this.getTitle = functionValidator(params.getTitle)
		this.getDescription = functionValidator(params.getDescription)
		this.getColor = functionValidator(params.getColor)
		this.onClick = functionValidator(params.onClick)
		this.onInsert = functionValidator(params.onInsert)
		this.onRemove = functionValidator(params.onRemove)
	}

	EventConstructor.prototype = {
		getId: function () { return this.getKey() + '-' + this.getInstanceIndex() },
		getInstanceIndex: function () { return this.instanceIndex || 0 },
		getKey: function () { return this.key },
		getBeginDate: function () { return this.beginDate },
		getEndDate: function () { return this.endDate },
		getTitle: function () { },
		getDescription: function () { },
		getColor: function () { }
	}
	return EventConstructor
}())

AuraCalendar.EventIterator = (function EVENT_ITERATOR_MODULE() {
	// Constructor
	function EventIterator(instanceParams, commonParams) {
		var u = AuraCalendar.utilities
		if (!instanceParams) instanceParams = {}
		if (!u.isArray(instanceParams)) instanceParams = [instanceParams]
		this.items = instanceParams.map(function (item, i) {
			return new AuraCalendar.Event({
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
	}

	EventIterator.prototype = {
		some: function (callback) {
			return this.items.some(function (item, i) {
				return callback(item, i)
			})
		},
		map: function (callback) {
			return this.items.map(function (item, i) {
				return callback(item, i)
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
			var firstYear = firstDate.getFullYear()
			var firstMonth = firstDate.getMonth()
			var secondYear = secondDate.getFullYear()
			var secondMonth = secondDate.getMonth()

			return firstYear < secondYear ? -1
				: firstYear > secondYear ? 1
					: firstMonth < secondMonth ? -1
						: firstMonth > secondMonth ? 1 : 0

		},
		month: function (firstDate, secondDate) {
			var firstYear = firstDate.getFullYear()
			var firstMonth = firstDate.getMonth()
			var firstDay = firstDate.getDate()
			var secondYear = secondDate.getFullYear()
			var secondMonth = secondDate.getMonth()
			var secondDay = secondDate.getDate()

			return firstYear < secondYear ? -1
				: firstYear > secondYear ? 1
					: firstMonth < secondMonth ? -1
						: firstMonth > secondMonth ? 1
							: firstDay < secondDay ? -1
								: firstDay > secondDay ? 1 : 0

		},
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
			// IE 10 or older => return version number
			if ((parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)) < 11) return true
		}
		return false
	},
	defaultEventColor: '#8bc34a'
}



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
			return this.custom(params)
		},
		pre: function (params) {
			if (!params) params = {}
			var now = new Date()
			now.setFullYear(2000)
			var dateBegin = new Date(now)
			now.setFullYear(2019)
			now.setMonth(u.random(11))
			var dateEnd = new Date(now)
			params.beginDate = dateBegin
			params.endDate = dateEnd
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
			return new CalendarEvent({
				key: u.either(params.key, u.random(1000000)),
				beginDate: params.beginDate,
				endDate: params.endDate,
				timing: u.either(params.timing, u.random(2)),
				stage: u.either(params.stage, u.random(4))
			})
		}
	},
	month: {
		single: function (params) {
			if (!params) params = {}
			var now = new Date()
			now.setDate(u.random(now.getDate() - 1))
			params.beginDate = now
			params.endDate = now
			return this.custom(params)
		},
		inside: function (params) {
			if (!params) params = {}
			var now = new Date()
			var dayBegin = u.random(now.getDate() - 1)

			now.setDate(dayBegin)
			var dateBegin = new Date(now)
			var dayEnd = dayBegin + u.random(u.daysInMonth(now) - 1 - dayBegin)
			now.setDate(dayEnd)
			var dateEnd = new Date(now)

			console.log(dateBegin.format('dd.MM.yyyy'), dateEnd.format('dd.MM.yyyy'));
			params.beginDate = dateBegin
			params.endDate = dateEnd
			return this.custom(params)
		},
		long: function (params) {
			if (!params) params = {}
			var now = new Date()
			var dayBegin = u.random(now.getDate() - 1)
			now.setDate(dayBegin)
			var dateBegin = new Date(now)
			var dayEnd = u.daysInMonth(now) - 1
			now.setDate(dayEnd)
			var dateEnd = new Date(now)

			params.beginDate = dateBegin
			params.endDate = dateEnd
			return this.custom(params)
		},
		pre: function (params) {
			if (!params) params = {}
			var now = new Date()
			now.setFullYear(2000)
			var dateBegin = new Date(now)
			now.setFullYear(2019)
			now.setMonth(u.random(11))
			var dateEnd = new Date(now)
			params.beginDate = dateBegin
			params.endDate = dateEnd
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
			return {
				key: u.either(params.key, u.random(1000000)),
				beginDate: params.beginDate,
				endDate: params.endDate
			}
		}
	}
}


var calendar = new AuraCalendar({
	container: '#calendar',
	view: 'month',
	getTitle: function () {
		return this.getKey()
	},
	getDescription: function () {
		return this
	},
	getColor: function () {
		return 'rgb(46, 115, 180)'
		return u.color()
		return '#' + this.getKey().toString(16).slice(0, 7)
		return '#111111'
	}
})

console.log(calendar)

calendar.render()

calendar.insertEvent([
	event.month.inside(),

])
