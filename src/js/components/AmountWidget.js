import {select, settings} from '../settings.js';
import BaseWidget  from './BaseWidget.js';

class AmountWidget extends BaseWidget{ 
  constructor(element){
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;
    //thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.getElements(element);
    //thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();

    //console.log('widget', thisWidget);
  }

  getElements( ){
    const thisWidget = this;
    
    //thisWidget.element = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  } 
  // setValue(value){ 
  //   const thisWidget = this;
  //   const newValue = thisWidget.parseValue(value);
  //   //if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){  
  //   if(newValue != thisWidget.value && thisWidget.isValid(newValue)){
  //     thisWidget.value = newValue; 
  //     thisWidget.announce(); 
  //   }
    
  //   thisWidget.renderValue();
  // }

  // parseValue(value){
  //   return parseInt(value);
  // }

  isValid(value){
    return !isNaN(value)
    && value >= settings.amountWidget.defaultMin 
    && value <= settings.amountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  } 
  initActions(){
    const thisWidget= this;
      
    thisWidget.dom.input.addEventListener('change', function() {
      thisWidget.value = thisWidget.dom.input.value;
    }); 

    thisWidget.dom.linkDecrease.addEventListener('click', function (event){
      event.preventDefault ();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function (event){
      event.preventDefault ();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
  // announce(){
  //   const thisWidget = this;

  //   const event = new CustomEvent('updated', {bubbles: true});
  //   thisWidget.element.dispatchEvent(event);
  // }
}

export default AmountWidget;