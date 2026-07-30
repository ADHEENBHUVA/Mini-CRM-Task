const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect('mongodb+srv://Adheen:Adheen123@cluster0.k2wll.mongodb.net/test?retryWrites=true&w=majority')
.then(async () => {
    const agg = await mongoose.connection.collection('leads').aggregate([
        { $match: { isDeleted: { $ne: true }, assignedEmployee: { $ne: null } } },
        { $group: { _id: '$assignedEmployee', won: { $sum: { $cond: [{ $eq: ['$result', 'Lead Won'] }, 1, 0] } }, lost: { $sum: { $cond: [{ $eq: ['$result', 'Lead Loss'] }, 1, 0] } } } },
        { $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'employee' } },
        { $unwind: '$employee' },
        { $project: { name: '$employee.name', won: 1, lost: 1, _id: 0 } }
    ]).toArray();
    console.log(JSON.stringify(agg, null, 2));
    process.exit(0);
})

