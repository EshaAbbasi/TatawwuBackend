const Registration = require("../models/Registeration");


const index = async (req, res) => {
    try{
      const registrations = await Registeration.find({});  
      res.status(200).json(registrations);
    
    }catch(error){
        res.status(500).json({error: error.message });
    }
};


const show = async (req,res) =>{

    try{
       const registration = await Registration.findById(req.params.id);
       if(!registration){
        return res.status(404).json({ error: "Registration not found" });           
        }
        res.status(200).json(registration);

    }catch(error)
    {
      res.status(500).json({error: error.message });
    }



};


const create = async (req, res) => {

    try {
        const registration = await Registration.create(req.body);
        res.status(201).json(registration);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }  

};




    const update = async (req, res) => {
try{
const registration = await Registration.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!registration) {
        return res.status(404).json({ error: "Registration not found" });
    }
    res.status(200).json(registration);
    


}catch(error){
            res.status(500).json({ error: error.message });

}
        
};





module.exports = {
    index,
    show,
    create,
    update,
};