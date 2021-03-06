import Backbone from 'backbone';
import Quote from '../models/quote';
import Order from '../models/order';
import OrderView from '../views/order_view';

const OrderListView = Backbone.View.extend ({
  initialize(params) {
    this.template = params.template;
    this.quotes = params.quotes;
    this.listenTo(this.model, 'update', this.render);
  },

  render() {
    this.$('#orders').empty();
    // create new open orders
    this.model.each((order) => {
      const orderView = new OrderView({
        model: order,
        template: this.template,
        tagName: 'li',
        className: 'orders',
        currentQuote: order.currentQuote,
        buy: order.buy
      });

      this.$('#orders').append(orderView.render().$el);

      // middle man in passing new trade
      this.listenTo(orderView, 'add_trade', this.addTrade);
    });

    return this;
  },

  addTrade(quote) {
    console.log('passing new trade to trades view');
    this.trigger('add_trade', quote);
  },

  events: {
    'click button.btn-buy': 'buyOrder',
    'click button.btn-sell': 'sellOrder',
  },

  buyOrder(event) {
    event.preventDefault();
    console.log('placing new buy order');
    this.makeOrder(true);
  },

  sellOrder(event) {
    event.preventDefault();
    console.log('placing new sell order');
    this.makeOrder(false);
  },

  makeOrder(option) {
    const formData = this.getFormData();
    formData['buy'] = option;

    // find corresponding quote model
    let currentQuote = this.quotes.findWhere({ symbol: formData['symbol']});
    formData['currentQuote'] = currentQuote;
    let currentPrice = currentQuote.get('price');
    formData['currentPrice'] = currentPrice;

    const newOrder = new Order(formData);
    if (newOrder.isValid()) {
      console.log('validations passed');
      this.model.add(newOrder);
      this.clearFormData();
      this.successMessage('New Open Order succesfully created');
    } else {
      console.log('invalid order');
      newOrder.destroy();
      this.errorsMessage(newOrder.validationError);
    }
  },

  clearFormData() {
    this.$('form input[name=price-target]').val('');
    this.$('form select[name=symbol]').val('HUMOR');
  },

  getFormData() {
    const orderData = {};

    let val = this.$('form input[name=price-target]').val();
    if (val != '') {
      orderData['targetPrice'] = parseInt(val);
    }

    val = this.$('form select[name=symbol]').val();
    if (val != '') {
      orderData['symbol'] = val;
    }

    console.log(orderData);
    return orderData;
  },

  clearMessage() {
    this.$('.form-errors').empty();
  },

  successMessage(message) {
    this.clearMessage();
    this.$('.form-errors').append(`<p class="success">${message}</p>`);
  },

  errorsMessage(errorsHash) {
    this.clearMessage();
    for (let attr in errorsHash) {
      this.$('.form-errors').append(`<p class="error">${errorsHash[attr]}</p>`);
    }
  },

});

export default OrderListView;
