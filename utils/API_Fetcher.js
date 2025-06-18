const Op=require('sequelize').Op;
module.exports=class ApiFeatures {
    constructor(sequelizeQueryOptions = {}, searchQuery = {}) {
        this.queryOptions = sequelizeQueryOptions;
        this.searchQuery = searchQuery;
        this.pageLimit = 10; // default value
        this.pageNum = 1;
        this.meta = {}; // will hold pagination meta
    }

    pagination(pageLimit) {
        this.pageLimit = pageLimit || 10;
        this.pageNum = Math.ceil(Math.abs(this.searchQuery.page * 1 || 1));
        const offset = (this.pageNum - 1) * this.pageLimit;

        this.queryOptions.limit = this.pageLimit;
        this.queryOptions.offset = offset;

        return this;
    }

    filtration() {
        const excluded = ["page", "sort", "pageLimit", "fields", "keyword"];
        const filterObj = { ...this.searchQuery };
        excluded.forEach(el => delete filterObj[el]);

        let where = {};
        for (let [key, value] of Object.entries(filterObj)) {
            if (typeof value === 'object') {
                let operatorKey = Object.keys(value)[0];
                let operatorValue = value[operatorKey];
                where[key] = { [Op[operatorKey]]: operatorValue };
            } else {
                where[key] = value;
            }
        }

        this.queryOptions.where = { ...(this.queryOptions.where || {}), ...where };
        return this;
    }

    sort() {
        if (this.searchQuery.sort) {
            const sortArray = this.searchQuery.sort.split(',').map(field =>
                field.startsWith('-') ? [field.substring(1), 'DESC'] : [field, 'ASC']
            );
            this.queryOptions.order = sortArray;
        } else {
            this.queryOptions.order = [['createdAt', 'DESC']];
        }

        return this;
    }

    fields() {
        if (this.searchQuery.fields) {
            this.queryOptions.attributes = this.searchQuery.fields.split(',');
        }
        return this;
    }

    // search(searchFields = ['name', 'description']) {
    //     if (this.searchQuery.keyword) {
    //         const keyword = this.searchQuery.keyword;
    //         const orConditions = searchFields.map(field => ({
    //             [field]: { [Op.iLike]: `%${keyword}%` }
    //         }));

    //         this.queryOptions.where = {
    //             ...(this.queryOptions.where || {}),
    //             [Op.or]: orConditions
    //         };
    //     }

    //     return this;
    // }

    async execute(model) {
        const { count, rows } = await model.findAndCountAll(this.queryOptions);

        const totalPages = Math.ceil(count / this.pageLimit);
        this.meta = {
            totalItems: count,
            currentPage: this.pageNum,
            totalPages: totalPages,
            pageLimit: this.pageLimit
        };

        return { data: rows, meta: this.meta };
    }

    getQueryOptions() {
        return this.queryOptions;
    }

    getMeta() {
        return this.meta;
    }
}
