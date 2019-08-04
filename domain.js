

class RentalDevice {
  
  constructor(id, name, category, rental_status) {
    this.managed_id = id;
    this.device_name = name;
    this.category_name = category;
    this.rental_status = rental_status;
  }
  
  async rentalDevice(rental_date, return_date) {
    this.rental_status = RentalStatuses.RENTALED;
    this.rental_date = rental_date;
    this.return_date = return_date;
  }
  
  isOverRentalTerm(start, end) {
    const maximum_rental_term = 31; // days
    const msec_of_one_day = 1000 * 60 * 60 * 24;
    const diff_msec = end.getTime() - start.getTime();
    
    return maximum_rental_term < Math.floor(diff_msec / msec_of_one_day);
  }
  
  isWorkingDay(date) {
    return ! [0, 6].includes(date.getDay()); // TODO: 日本の祝日
  }
}

const RentalStatuses = {
  UNRENTALED: "unrentaled", // 未貸し出し
  RENTALED: "rentaled",  // 貸出中
  NOT_IN_SERVICE: "not_in_service", // 貸し出し不可
  DISPOSED: "disposed" // 廃棄
}

class RentalDeviceTable {
  
  constructor(device_list) {
    this.device_list = Array.from(device_list)
      .filter(device => device instanceof RentalDevice);
  }
  
  getDeviceListOfCategory(category) {
    return this.device_list
      .filter(device => device.categoryName === category)
  }
  
  getCategoryList(category) {
    return this.device_list
      .map(device => device.categoryName)
      .filter((ele, idx, arr) => arr.indexOf(ele) === idx)
  }
  
  async getMessageParamsWith(action, username) {
    if (action == RentalActions.RENTAL) {
      return getRentalParams();
    } else if (action === RentalActions.RETURN) {
      return getReturnParams();
    } else if (action === RentalActions.POSTPON) {
      return getPostponParams();
    } else {
      return {}; // Invalid
    }
  }
  
  async getMsgParamsOfRental(username) {
    
  }
}

const RentalActions = { 
  RENTAL: "rental",
  RETURN: "return",
  POSTPON: "postpon"
};

