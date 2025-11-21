/** Guide
* 1. Define in queue_names
* 2. write function process on queue.process 
* 3. using : helpers.queue.addJob(<queue_name>,<data>);
*/
const BullQueue = require('bull');

const queue_config = {
	prefix: 'bq',
    redis: {
		keyPrefix: `${process.env.REDIS_PREFIX}_${process.env.ENV}_`,
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
		username: process.env.REDIS_USER,
		password: process.env.REDIS_PASS,
		ttl: process.env.REDIS_TTL,
		db: process.env.REDIS_DB,
		options: {}
	},
    removeOnSuccess: true,
	removeOnComplete: true,
    removeOnFailure: true
}

//Define queue
let queue_names = [
	//'queue_send_message'
];

//Init all queue
global.queue_list = {}
if(queue_names.length > 0){
	queue_names.forEach((key)=>{queue_list[key] = new BullQueue(key, queue_config);});
}
const queue = {};

/**
 * Add job to queue
*/
queue.addJob = async (queue_name,data) => {
	try{
		await queue_list[queue_name].add(data)
		return new Promise( (resolve) => {
			queue_list[queue_name].on('completed',(job, result)=>{
				//clog(job.id,result)
				job.remove()
				return resolve({job_status:result});
			})
			queue_list[queue_name].on('error',(e)=>{
				clog(e)
				return resolve({job_status:false,msg:e.message});
			})
			queue_list[queue_name].on('failed',(e)=>{
				clog(e)
				return resolve({job_status:false,msg:e.message});
			})
		})
	}catch(e){
		return {job_status:false, msg: e.message}
	}

	// return new Promise( (resolve) => {
	// 	try{
	// 		if(!queue_list[queue_name]) {
	// 			return resolve({job_status:false,msg:queue_name+'Not found'});
	// 		}
	// 	    queue_list[queue_name].add(data).then((result)=>{
	// 			clog(result)
	// 			return resolve({job_status:result.job_status});
	// 		})
	// 	    // //job.save();
	// 	    // job.on('succeeded', (result) => {
	// 	    // 	//console.log(`${queue_name} succeeded for job ${job.id}: ${result}`);
	// 	    //     return resolve({job_status:true,msg:result});
	// 	    // });
	// 	    // job.on('failed', (e) => {
	// 	    // 	//console.log(`${queue_name} failed for job ${job.id}: ${e.message}`);
	// 	    //     return resolve({job_status:false,msg:e.message});
	// 	    // });
	// 	    // job.on('retrying', (err) => {
	// 	  	// 	//console.log(`Job ${job.id} failed with error ${err.message} but is being retried!`);
	// 		// });
	// 		// return job;
	// 	}catch(e){
	// 		return resolve({job_status:false,msg:e.message});
	// 	}
	// })
};

/**
 * Process queue
*/
queue.process = async () => {
	try {
		if(Object.keys(queue_list).length == 0) return;

		//clog(queue_list)

	    queue_list['queue_send_message'].process(async (job) => {
			let data = job.data;
			//clog(data)
	        return {status:`send mess user ${data.user} success`};
	    });

	    return {status:true};
	} catch(e) {
	    console.log("Can't define queue",e.message);
	    return {status:false,msg:e.message};
	}
}

//start
queue.process();

module.exports = queue;
