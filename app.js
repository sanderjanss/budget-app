
// BUDGET CONTROLLER
var budgetController = (function(){ // This is an IIFY, immeadeatly invoked function, an IIFY is independant and standalone

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1;
        }
        
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    
    };

    return {
        addItem: function(type, desc, val){
            var newItem, ID;
            

            // Create new ID
            if(data.allItems[type].length>0){
            ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
            newItem = new Expense(ID, desc, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, desc, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem : function(type, id){
            var ids, index;
            // map works as a loop but can return a new array

            ids = data.allItems[type].map(function(current){
                return current.id;
            })

            index = ids.indexOf(id);

            if (index !== -1){
                data.allItems[type].splice(index, 1);
            } 
        },

        calculateBudget: function(){
            
            //calculate total income and expenses

            calculateTotal('exp');
            calculateTotal('inc');

            //calculate Budget: income - expenses

            data.budget = data.totals.inc - data.totals.exp;

            //calculate percentage of income that we spend
            if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
            data.percentage = -1;
            }
        },

        calculatePercentage : function(){
            data.allItems.exp.map(function(cur){
                    cur.calcPercentage(data.totals.inc);
            })

        },

        getPercentages : function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage(); 
            })
            return allPerc;
        },

        getBudget : function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }

    }

})();

// Seperation of concerns, 2 Controllers dont know about each other, standalone
// UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        descriptionType:'.add__description',
        valueType: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    }

    var formatNumber = function(num, type){
        // + or - before the number
        // exactly 2 decimalpoints
        // comma separating the thousands
        var int, decimal, numSplit;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.')
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        decimal = numSplit[1];
        console.log(type);
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + decimal;
    };

    var nodeListForEach = function(list, callback){
        for(i = 0; i < list.length; i++){
            callback(list[i], i);
        }
   }

    return {
        getInput: function(){
            return {
            type : document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
            description : document.querySelector(DOMstrings.descriptionType).value,
            value : parseFloat(document.querySelector(DOMstrings.valueType).value)

        };
    },  

        addListItem: function(obj, type){
            var html, newHtml, element;

            //create HTML STRING with placeholder text
            if(type === "inc"){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else {
                element = DOMstrings.expensesContainer;
             html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //replace the placeholdertext with actual date
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            //insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)

        },

        deleteListItem: function(selectorID){

            var element;
            element =  document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        
        clearFields: function(){
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMstrings.descriptionType + ', ' + DOMstrings.valueType);
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array){
                current.value = "";

            });
            fieldsArray[0].focus();
        },
        displayBudget: function(obj){

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage> 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentage: function(percentages){
           var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
           
           nodeListForEach(fields, function(current, index){

            if(percentages[index] > 0){
                current.textContent = percentages[index] + '%';
            } else {
                current.textContent = '---';
            }
            
           })
        },

        displayMonth: function(){
            var now, year, month, months;
            now = new Date();
            months = ['Januari', 'Februari', 'Mars', 'April', 'Mei', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
        },

        changedType : function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.descriptionType + ',' +
                DOMstrings.valueType
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            })
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    }
})()

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){

        if(event.keyCode === 13  || event.which === 13){
            ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updatePercentage = function(){
        // 1. Calculate the percentages
        budgetCtrl.calculatePercentage();

        // 2. Return the percentages
        var percentages = budgetCtrl.getPercentages();

        // 3. Display the percentages
        UICtrl.displayPercentage(percentages);
    };

    var updateBudget = function(){
        var budget;

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        budget = budgetCtrl.getBudget();

        // 3. Display the budget
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function(){
        var newItem, input;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        // 3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        // 3.1 Clear fields

        UICtrl.clearFields();

        // 4. Calculate and update Budget

        updateBudget();

        // 5. Calculate and update Percentages

        updatePercentage();

        }

    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID){

            splitID = itemID.split('-');
            console.log(splitID);
            type = splitID[0];
            console.log(type);
            id = parseInt(splitID[1]);
            console.log(id);

            // 1. Delete the item from the data structure

            budgetCtrl.deleteItem(type, id);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget

            updateBudget();

            // 4. Calculate and update Percentages

            updatePercentage();

        }
    };

    return {
        init: function(){
            console.log("The Application has started.")
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();

            UICtrl.displayMonth();
            
        }
    }

})(budgetController, UIController)

controller.init();













