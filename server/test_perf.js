const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/adheen2')
    .then(async () => {
        const agg = await mongoose.connection.collection('leads').aggregate([
            { $match: { isDeleted: { $ne: true }, assignedEmployee: { $ne: null } } },
            { $group: { _id: '$assignedEmployee', won: { $sum: { $cond: [{ $eq: ['$result', 'Lead Won'] }, 1, 0] } }, lost: { $sum: { $cond: [{ $eq: ['$result', 'Lead Loss'] }, 1, 0] } } } },
            { $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'employee' } },
            { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
            { $project: { name: '$employee.name', won: 1, lost: 1, _id: 0, test_id: '$_id' } }
        ]).toArray();
        console.log('Result:', JSON.stringify(agg, null, 2));
        process.exit(0);
    });
