const Orgnaization=require(".../models/Orgnaization");

const create =async(req,res)=>{
    try{
     
        const organization=await Orgnaization.create(req.body);
        res.status(201).json(organization);
        
    
    }
    catch(error){
res.status(400).json({
    error:error.message
})
    }
};
const index = async (req, res) => {
  try {

    const organizations = await Organization.find();
    res.status(200).json(organizations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const show = async (req, res) => {
  try {
    const organization = await Orgnaizationrganization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports={
create,index,show
}