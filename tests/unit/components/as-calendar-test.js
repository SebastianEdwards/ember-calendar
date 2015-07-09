import hbs from 'htmlbars-inline-precompile';
import { test, moduleForComponent } from 'ember-qunit';
import Ember from 'ember';
import moment from 'moment';
import { initialize as momentInitializer } from 'dummy/initializers/ember-moment';
import calendarPage from '../../helpers/calendar-page';

momentInitializer();

moduleForComponent('as-calendar', 'AsCalendarComponent', { integration: true });

test('Add an occurrence', function(assert) {
  this.set('occurrences', Ember.A());

  this.on('calendarAddOccurrence', (occurrence) => {
    this.get('occurrences').pushObject(occurrence);
  });

  this.render(hbs`
    {{as-calendar
      title="Ember Calendar"
      occurrences=occurrences
      dayStartingTime="9:00"
      dayEndingTime="18:00"
      timeSlotDuration="00:30"
      onAddOccurrence="calendarAddOccurrence"}}
  `);

  assert.equal($('.as-calendar-occurrence').length, 0,
    'it shows an empty calendar'
  );

  calendarPage.selectTime({ day: 0, timeSlot: 0 });

  assert.equal($('.as-calendar-occurrence').length, 1,
    'it adds the occurrence to the calendar'
  );
});

test('Remove an occurrence', function(assert) {
  this.set('occurrences', Ember.A());

  this.on('calendarAddOccurrence', (occurrence) => {
    this.get('occurrences').pushObject(occurrence);
  });

  this.on('calendarRemoveOccurrence', (occurrence) => {
    this.get('occurrences').removeObject(occurrence);
  });

  this.render(hbs`
    {{as-calendar
      title="Ember Calendar"
      occurrences=occurrences
      dayStartingTime="9:00"
      dayEndingTime="18:00"
      timeSlotDuration="00:30"
      onAddOccurrence="calendarAddOccurrence"
      onRemoveOccurrence="calendarRemoveOccurrence"}}
  `);

  calendarPage.selectTime({ day: 0, timeSlot: 0 });

  assert.equal($('.as-calendar-occurrence').length, 1,
    'it adds the occurrence to the calendar'
  );

  Ember.run(() => {
    $('.as-calendar-occurrence .remove').click();
  });

  assert.equal($('.as-calendar-occurrence').length, 0,
    'it removes the occurrence from the calendar'
  );
});


test('Resize an occurrence', function(assert) {
  this.set('occurrences', Ember.A());

  this.on('calendarAddOccurrence', (occurrence) => {
    this.get('occurrences').pushObject(occurrence);
  });

  this.on('calendarUpdateOccurrence', (occurrence, properties) => {
    occurrence.setProperties(properties);
  });

  this.render(hbs`
    {{as-calendar
      title="Ember Calendar"
      occurrences=occurrences
      dayStartingTime="9:00"
      dayEndingTime="18:00"
      timeSlotDuration="00:30"
      defaultOccurrenceDuration="00:30"
      onAddOccurrence="calendarAddOccurrence"
      onUpdateOccurrence="calendarUpdateOccurrence"}}
  `);

  calendarPage.selectTime({ day: 0, timeSlot: 0 });

  assert.equal($('.as-calendar-occurrence').length, 1,
    'it adds the occurrence to the calendar'
  );

  calendarPage.resizeOccurrence($('.as-calendar-occurrence'), { timeSlots: 2 });

  assert.equal($('.as-calendar-occurrence').height(), calendarPage.timeSlotHeight() * 3,
    'it resizes the occurrence');
});

test('Drag an occurrence', function(assert) {
  this.set('occurrences', Ember.A());

  this.on('calendarAddOccurrence', (occurrence) => {
    this.get('occurrences').pushObject(occurrence);
  });

  this.on('calendarUpdateOccurrence', (occurrence, properties) => {
    occurrence.setProperties(properties);
  });

  this.render(hbs`
    {{as-calendar
      title="Ember Calendar"
      occurrences=occurrences
      dayStartingTime="9:00"
      dayEndingTime="18:00"
      timeSlotDuration="00:30"
      onAddOccurrence="calendarAddOccurrence"
      onUpdateOccurrence="calendarUpdateOccurrence"}}
  `);

  calendarPage.selectTime({ day: 0, timeSlot: 0 });

  assert.equal(this.$('.as-calendar-occurrence').length, 1,
    'it adds the occurrence to the calendar'
  );

  calendarPage.dragOccurrence(this.$('.as-calendar-occurrence'), { days: 2, timeSlots: 4 });

  var $occurrence = this.$('.as-calendar-occurrence');

  var dayOffset = Math.floor($occurrence.offset().left -
    this.$('.as-calendar-timetable-content').offset().left);

  var timeSlotOffset = Math.floor($occurrence.offset().top -
    this.$('.as-calendar-timetable-content').offset().top);

  assert.equal(dayOffset, Math.floor(calendarPage.dayWidth() * 2),
    'it drags the occurrence to the correct day'
  );
  assert.equal(timeSlotOffset, calendarPage.timeSlotHeight() * 4,
    'it drags the occurrence to the correct timeslot'
  );
  assert.equal($occurrence.height(), calendarPage.timeSlotHeight() * 2,
    'it keeps the duration of the occurrence'
  );
});

test('Change time zone', function(assert) {
  this.set('occurrences', Ember.A([
    Ember.Object.create({
      startsAt: moment().utc().startOf('day').add(9, 'hours'),
      endsAt: moment().utc().startOf('day').add(10, 'hours'),
      title: 'Example Occurrence'
    })
  ]));

  this.on('calendarAddOccurrence', (occurrence) => {
    this.get('occurrences').pushObject(occurrence);
  });

  this.render(hbs`
    {{as-calendar
      title="Ember Calendar"
      occurrences=occurrences
      timeZone="UTC"
      dayStartingTime="9:00"
      dayEndingTime="18:00"
      timeSlotDuration="00:30"
      onAddOccurrence="calendarAddOccurrence"}}
  `);

  assert.equal($('.as-calendar-occurrence').position().top, 0,
    'it shows the occurrence in the UTC time zone');

  calendarPage.selectTimeZone('London');

  assert.equal($('.as-calendar-occurrence').position().top, calendarPage.timeSlotHeight() * 2,
    'it shows the occurrence in the London time zone');
});
