import Backbone from 'backbone';
import Order from '../models/order';
import Quote from '../models/quote';

const OrderView = Backbone.View.extend({
  initialize(params) {
    this.template = params.template;
    this.currentQuote = params.currentQuote;
    this.buy = params.buy;

    this.listenTo(this.currentQuote, 'change', this.checkPrice);
  },

  render() {
    console.log(this.model.toJSON());
    const compiledTemplate = this.template(this.model.toJSON());
    this.$el.html(compiledTemplate);

    return this;
  },

  events: {
    'click button.btn-cancel': 'removeOrder',
  },

  removeOrder(event) {
    this.model.destroy();
  },

  checkPrice() {
    // console.log('checking prices');
    console.log(`buy: ${this.buy}`);
    console.log(`targetPrice: ${this.model.targetPrice}`);
    console.log(`currentPrice: ${this.currentQuote.get('price')}`);

    // Convert prices to number

    if (this.buy && parseInt(this.model.targetPrice) >= parseInt(this.currentQuote.get('price'))) {
      console.log('let\'s buy it');

      this.currentQuote.buy();
      this.removeOrder();
      this.stopListening();

      const quote = {
        price: this.currentQuote.get('price'),
        symbol: this.currentQuote.get('symbol'),
        buy: this.buy,
      }

      this.trigger('add_trade', quote);
    }
    else if (!this.buy && parseInt(this.model.targetPrice) <= parseInt(this.currentQuote.get('price'))) {
      console.log('let\'s sell it');
      
      this.currentQuote.sell();
      this.removeOrder();
      this.stopListening();

      const quote = {
        price: this.currentQuote.get('price'),
        symbol: this.currentQuote.get('symbol'),
        buy: this.buy,
      }

      this.trigger('add_trade', quote);
    }
  },

});


export default OrderView;
