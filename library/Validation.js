
class Validation {
	constructor(){
		
		this.errors = {};
		this.masterData = [];

		this.errorList = {
			en:{
				required		: 'The {field} field is required.',
				isset			: 'The {field} field must have a value.',
				valid_email		: 'The {field} field must contain a valid email address.',
				valid_emails		: 'The {field} field must contain all valid email addresses.',
				valid_url		: 'The {field} field must contain a valid URL.',
				valid_ip		: 'The {field} field must contain a valid IP.',
				valid_mac		: 'The {field} field must contain a valid MAC.',
				valid_base64		: 'The {field} field must contain a valid Base64 string.',
				min_length		: 'The {field} field must be at least {param} characters in length.',
				max_length		: 'The {field} field cannot exceed {param} characters in length.',
				exact_length		: 'The {field} field must be exactly {param} characters in length.',
				alpha			: 'The {field} field may only contain alphabetical characters.',
				alpha_numeric		: 'The {field} field may only contain alpha-numeric characters.',
				alpha_numeric_spaces	: 'The {field} field may only contain alpha-numeric characters and spaces.',
				alpha_dash		: 'The {field} field may only contain alpha-numeric characters, underscores, and dashes.',
				numeric		: 'The {field} field must contain only numbers.',
				isNumeric		: 'The {field} field must contain only numeric characters.',
				integer		: 'The {field} field must contain an integer.',
				regex_match		: 'The {field} field is not in the correct format.',
				matches		: 'The {field} field does not match the {param} field.',
				differs		: 'The {field} field must differ from the {param} field.',
				is_unique 		: 'The {field} field must contain a unique value.',
				is_natural		: 'The {field} field must only contain digits.',
				is_natural_no_zero	: 'The {field} field must only contain digits and must be greater than zero.',
				decimal		: 'The {field} field must contain a decimal number.',
				less_than		: 'The {field} field must contain a number less than {param}.',
				less_than_equal_to	: 'The {field} field must contain a number less than or equal to {param}.',
				greater_than		: 'The {field} field must contain a number greater than {param}.',
				greater_than_equal_to	: 'The {field} field must contain a number greater than or equal to {param}.',
				error_message_not_set	: 'Unable to access an error message corresponding to your field name {field}.',
				inList		: 'The {field} field must be one of: {param}.',
				notNaN		: 'The {field} field must contain only numeric characters.',
				isString		: 'The {field} field must be string and not empty.',
				maxlen		: 'The {field} field cannot exceed {param} characters in length.',
				exactlen		: 'The {field} field contain {param} characters in length.',
				validParams		: 'Input has extra params: {param}.',
				equalTo		: 'The {field} must equal to: {param}.',
				typeof		: 'The {field} is not a valid data type',
			}
		}

		this.errorMessageList = this.errorList.en;
	}

	clean(){
		this.errors = {};
		this.masterData = [];
	}

	isValidUnixTimeStampInSeconds(timeStamp){
		if (true) {
			return true
		}else{
			return false;
		}
	}

	_setError(field,rule, error){
		this.errors[field] = error;
		// this.errors.push({field, rule, error});
		return this;
	}

	equalTo(val,compare){
		if (val == compare) {
			return true
		}else{
			return false;
		}
	}

	setRule(value, name=null, rules = null, errors = null){
		rules = rules.split(/\|(?![^\[]*\])/);
		this.masterData.push({value, name, rules,errors});
		return this;
	}

	run(){

		if (this.masterData.length == 0) {
			return false;
		}

		for(let i = 0; i<this.masterData.length;i++){
			let data = this.masterData[i];
			this._execute(data);
		}

		// no error found
		if (Object.keys(this.errors).length === 0) {
			return true;
		}
		return false;
	}

	_execute(data){
		let {rules, value, name, errors} = data;
		let result = false;
		for(let i in rules){
			let rule = rules[i];
			let params=false;
			let isMatchedParamsRegex = rule.match(/(.*?)\[(.*?)\]/);
			let isNativeCallable = false;
			// if already error is set bail out
			if (typeof this.errors[name] != 'undefined')  {
				continue;
			}

			if (isMatchedParamsRegex) {
				rule = isMatchedParamsRegex[1];
				params = isMatchedParamsRegex[2];
			}

			// node native function call
			if (typeof global != 'undefined' && typeof global[rule] == 'function') {
				isNativeCallable = true;
				result = (params !== false) ? global[rule](value,params) : global[rule](value);
			}else if (typeof window != 'undefined' && typeof window[rule] == 'function') {
				isNativeCallable = true;
				result = (params !== false) ? window[rule](value,params) : window[rule](value);
			}else if(typeof this[rule] == 'function'){
				result = (params !== false) ? this[rule](value,params) : this[rule](value);
			}else{
				if (typeof this.errors[name] == 'undefined') {
					this._setError(name, rule, `${rule} rule not found.`);	
				}				
			}

			if (result == false) {
				let line = '';				
				
				if(errors){
					line = errors;
				}else{
					line = typeof this.errorMessageList[rule]  != 'undefined' ? this.errorMessageList[rule] : `${this.errorMessageList.error_message_not_set}.(function ${rule})`;
				}
				let message = this._buildErrorMsg(line,name,params );
				this._setError(name, rule, message);
			}
		}
	}

	required(value){		
		return typeof value != 'undefined';
	}

	getRawErrors(){
		return this.errors;		
	}	
	
	getErrors(){
		let errors = [];
		for(let k in this.errors){
			errors.push({
				param: k,
				message: this.errors[k],
			})
		}
		return errors;		
	}

	isNumeric(str){
		// return !isNaN(str) && str !== '';
		return /^\d+$/.test(str);
	}

	isString(str){
		return typeof str == 'string' && str.trim() != '';
	}

	validParams(validArr, inputArr){
		inputArr = inputArr.split(',');		
		let difference = inputArr.filter(x => !validArr.includes(x));
		return !difference.length
	}

	maxlen(str, param){
		if(str.trim() == ''){
			return true;
		}
		
		if(this.isString(str)){
			return str.length <= param;
		}
		return false;
	}

	exactlen(str, param){
		if(this.isString(str)){
			return str.length == param;
		}
		return false;
	}

	/* isNotEmpty(str, params){
		if(params == 'string'){
			return typeof str == 'string' && str != '';
		}
		if(typeof params == 'number'){
			return typeof str == 'number' && str != 0;
		}
	} */

	inList(value, list){
		let type = typeof value;
		
		return list.split(',').map(v=>{
			if (type == 'number') {
				return Number(v);
			}
			if (type == 'string') {
				return String(v);
			}
			return v;
		}).indexOf(value) != -1;
	}

	typeof(value, type){
		return typeof value === type;
	}

	_buildErrorMsg(line, field, param){
		return line.replace(/{field}/g, field).replace(/{param}/g, param);
	}
}

module.exports = Validation;
