const AppError = require("../../../utils/AppError");
const catchError = require("../../../utils/catchError");
const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/sequelizeDb.js');
const defineWorkflowConfig = require('../../../models/workflow_config');
const workflow_config = defineWorkflowConfig(sequelize, DataTypes);
const defineWorkflowNodes = require('../../../models/workflownodes');
const workflowNodes = defineWorkflowNodes(sequelize, DataTypes); 
const { Op } = require("sequelize");

/*                  Helper Functions                     */
const pagination = (page, limit) => {
    const pageNum = parseInt(page, 10) || 1;
    const pageLimit = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * pageLimit;
    return { limit: pageLimit, offset };
};
const sorting = (sort, columns, orderArray) => {
    try {
        orderArray = sort.split(',').map(col => {
            const [field, dir] = col.trim().split(':');
            if (!columns.includes(field)) {
                throw new AppError(`Invalid sort field: ${field}`, 409);
            }
            const direction = (dir && dir.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';
            return [field, direction];
        });
        return orderArray;
    } catch (err) {
        return new AppError(err.message, 409);
    }
}
// recursive function to get a node and its offsprings
const getNodeWithOffsprings = async (nodeId) => {
    
  const node = await workflowNodes.findOne({
    where: { id: nodeId }
  });
  if (!node) return null;

  const childNodes = await workflowNodes.findAll({
    where: { parentId: nodeId }
  });

  const childNodesWithOffsprings = await Promise.all(
    childNodes.map((child) => getNodeWithOffsprings(child.id))
  );

  return {
    ...node.toJSON(),
    children: childNodesWithOffsprings.filter(Boolean)
  };
};
/*                  Controller Functions                     */
/*                         Getters                           */
const getNodes = catchError(async (req, res, next) => {
    const { page, limit, sort } = req?.query;
    // Ensure model is defined and is a Sequelize model
    if (!workflowNodes?.getAttributes) {
        return next(new AppError('Model is not defined or not a valid Sequelize model.',404));
    }

    // Get sortable columns, excluding 'parentId' (but keep 'id' for sorting if needed)
    const columns = Object.keys(workflowNodes.getAttributes()).filter(col => col !== 'parentId' && col !== 'id');

    const paginationOptions = pagination(page, limit);

    // Default order by createdAt DESC
    let orderArray = [['createdAt', 'DESC']];
    if (sort) {
        orderArray = sorting(sort, columns, orderArray);
        if (orderArray instanceof Error) {
            return next(orderArray);
        }
    }
    const total = await workflowNodes.count()
    // Fetch paginated nodes
    const nodes = await workflowNodes.findAll({
        ...paginationOptions,
        order: orderArray
    });
    
    const meta = {
        total,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        totalPages: Math.ceil(total / (parseInt(limit, 10) || 10))
    };
    res.status(200).json({ nodes,meta });    
})
const getRoots = catchError(async (req, res, next) => {
    const { page, limit, sort } = req?.query;
    // Ensure model is defined and is a Sequelize model
    if (!workflowNodes?.rawAttributes) {
        return next(new AppError('Model is not defined or not a valid Sequelize model.',404));
    }

    // Get sortable columns, excluding 'parentId' (but keep 'id' for sorting if needed)
    const columns = Object.keys(workflowNodes.rawAttributes).filter(col => col !== 'parentId' && col !== 'id');

    const paginationOptions = pagination(page, limit);

    // Default order by createdAt DESC
    let orderArray = [['createdAt', 'DESC']];
    if (sort) {
        orderArray = sorting(sort, columns, orderArray);
        if (orderArray instanceof Error) {
            return next(orderArray);
        }
    }
    // Fetch total count for meta
    const total = await workflowNodes.count({ where: { parentId: null } });
    // handle lang attributes
    const defualtAttributes=["id","textType","parentId","optionType","icon","notes"];
    
    // Fetch paginated nodes
    const filter={...paginationOptions,order: orderArray,where: { parentId: null }}
    /*if(req?.lang) {
	    console.log("lang set: ",req.lang);
        req.lang === "ar" ? defualtAttributes.push("nameAr","guidingTextAr","guidingImagesAr") : defualtAttributes.push("name","guidingText","guidingImages");
        filter.attributes = defualtAttributes;
    }*/
	//console.log(filter);
    const nodes = await workflowNodes.findAll(filter);
    if( !nodes || nodes.length === 0) {
        return res.status(404).json({ message: "No root nodes found" });
    }
    const meta = {
        total,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        totalPages: Math.ceil(total / (parseInt(limit, 10) || 10))
    };
    res.status(200).json({ nodes,meta });    
})
const nodeOffsprings=catchError(async(req,res,next)=>{
    const { page, limit, sort } = req?.query;
    const { nodeId } = req.params;

    // Ensure model is defined and is a Sequelize model
    if (!workflowNodes?.rawAttributes) {
        return next(new AppError('Model is not defined or not a valid Sequelize model.',404));
    }

    if (!nodeId) {
        return next(new AppError("Node ID is required", 400));
    }

    // Get sortable columns, excluding 'parentId' and 'id'
    const columns = Object.keys(workflowNodes.rawAttributes).filter(col => col !== 'parentId' && col !== 'id');
    const paginationOptions = pagination(page, limit);

    // Default order by createdAt DESC
    let orderArray = [['createdAt', 'DESC']];
    if (sort) {
        orderArray = sorting(sort, columns, orderArray);
        if (orderArray instanceof Error) {
            return next(orderArray);
        }
    }

    // Fetch total count for meta
    const total = await workflowNodes.count({ where: { parentId: nodeId } });

    // handle lang attributes
    const defualtAttributes = ["id", "textType", "parentId", "optionType", "icon", "notes"];

    // Fetch paginated nodes
    const filter = { ...paginationOptions, order: orderArray, where: { parentId: nodeId } };
    /*if (req?.lang) {
        req.lang === "ar"
            ? defualtAttributes.push("nameAr", "guidingTextAr", "guidingImagesAr")
            : defualtAttributes.push("name", "guidingText", "guidingImages");
        filter.attributes = defualtAttributes;
    }*/
    // console.log(filter);
    const offsprings = await workflowNodes.findAll(filter);

    if (!offsprings || offsprings.length === 0) {
        return res.status(200).json({ nodes: [] });
    }

    const meta = {
        total,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 10,
        totalPages: Math.ceil(total / (parseInt(limit, 10) || 10))
    };

    res.status(200).json({ nodes: offsprings, meta });
})
const NodesTraversal=catchError(async (req, res, next) => {
    const { page, limit, sort } = req?.query;
    const rootNodes = await workflowNodes.findAll({
    where: { parentId: null }
    });

    const rootNodesWithOffsprings = await Promise.all(
        rootNodes.map((rootNode) => getNodeWithOffsprings(rootNode.id))
    );

    let result = rootNodesWithOffsprings.filter(Boolean);
    result = result.length === 0 ? null : result;
    res.status(200).json({ nodes: result });
})
const singleNode = catchError(async (req, res, next) => {
    const { nodeId } = req.params;
    if (!nodeId) {
        return next(new AppError("Node ID is required", 400));
    }
    const node = await workflowNodes.findOne({ where: { id: nodeId } });
    if (!node) {
        return next(new AppError("Node not found", 404));
    }
    res.status(200).json({ node });
});
// Create a new node
const createNode = catchError(async (req, res,next) => {
    const {
        name,
        nameAr,
        parentId,
        guidingText,
        guidingTextAr,
        textType,
        optionType,
        notes
    } = req.body;
    
    if (parentId) {
        //check if the parent is valid
        const existingParent = await workflowNodes.findOne({ where: { id: parentId } });

        if (!existingParent) {
            return next(new AppError("Parent node not found",404));
        }
        const parentOffsprings = await workflowNodes.findAll({ 
            where: { 
            parentId
            }, 
            attributes: ["name", "nameAr"] 
        });
        // check if the name already exists in the same level
        if (parentOffsprings.some(offspring => offspring.name === name || offspring.nameAr === nameAr)) {
            return next(new AppError("Node with the same name already exists in the same level",400));

        }
    }
    if(!parentId) {

        // check if the name already exists in the root level
        const rootNodes = await workflowNodes.findAll({ where: { parentId: null }, attributes: ["name","nameAr","icon",] });
        if (rootNodes.some(node => node.name === name|| node.nameAr === nameAr)) {
            return res.status(400).json({ message: "Node with the same name already exists in the root level" });
        }
    }

    let imgFields={};
    if(req.files){
        imgFields.icon = req.files?.icon
        imgFields.guidingImages = req.files?.guidingImages
        imgFields.guidingImagesAr = req.files?.guidingImagesAr
    }
    const fields = Object.keys(imgFields);
    const images = {};
    fields.forEach((field) => {
        const files = imgFields[field];
        images[field] = files && files.length > 0
            ? files.map((file) => ({
                displayName: file.originalname,
                path: file.path.replace(/\\/g, "/")
            }))
            : [];
    });
    
    // Use the 'images' variable here if needed, or remove it if not required.
    const newNode = await workflowNodes.create({
        name,
        nameAr,
        parentId,
        guidingText,
        guidingTextAr,
        textType,
        optionType,
        icon: images?.icon,
        guidingImages: images?.guidingImages,
        guidingImagesAr: images?.guidingImagesAr,
        notes
    });


    res.status(201).json({newNode, message: "Node created successfully"});
})
const updateNode=catchError(async (req, res,next) => {
    const id = req.params?.nodeId;
    let imgFields={};
    if(req.files){
        imgFields.icon = req.files?.icon
        imgFields.guidingImages = req.files?.guidingImages
        imgFields.guidingImagesAr = req.files?.guidingImagesAr
    }
    const fields = Object.keys(imgFields);
    const images = {};
    fields.forEach((field) => {
        const files = imgFields[field];
        images[field] = files && files.length > 0
            ? files.map((file) => ({
                displayName: file.originalname,
                path: file.path.replace(/\\/g, "/")
            }))
            : [];
    });

    const {parentId} = req.body;
    if (parentId) {
        //check if the parent is valid
        const existingParent = await workflowNodes.findOne({where: {id: parentId}});
        if (!existingParent) {
            return next(new AppError("Parent Option Not Exist", 404));
        }
        if (parentId == id) {
            return res.status(400).json({
                message: "Parent ID cannot be the same as Node ID"
            });
        }
    }
    const node = await workflowNodes.findOne({ where: { id } });
    if (!node) {
        return res.status(404).json({ message: "Node not found" });
    }

    // Prepare update data
    let updateData = { ...req.body };
    const { name, nameAr, parentId: newParentId } = updateData;

    // Check for duplicate name or nameAr in the same level (same parentId)
    if (name || nameAr) {
        const duplicateNode = await workflowNodes.findOne({
            where: {
                [Op.or]: [
                    ...(name ? [{ name }] : []),
                    ...(nameAr ? [{ nameAr }] : [])
                ],
                parentId: newParentId !== undefined ? newParentId : node.parentId,
                id: { [Op.ne]: id }, // Exclude current node
            }
        });
        if (duplicateNode) {
            return res.status(400).json({ message: "Node with the same name or nameAr already exists in the same level" });
        }
    }
    if (fields.length > 0) {
        if (imgFields.icon) updateData.icon = images?.[0] || [];
        if (imgFields.guidingImages) updateData.guidingImages = images?.[1] || [];
        if (imgFields.guidingImagesAr) updateData.guidingImagesAr = images?.[2] || [];
    }
    await node.update(updateData);
    res.status(200).json(node);
});
const removeNode = catchError(async (req, res, next) => {
    const { nodeId } = req.params;
    if (!nodeId) {
        return next(new AppError("Node ID is required", 400));
    }
    const node = await workflowNodes.findOne({ where: { id: nodeId } });
    if (!node) {
        return next(new AppError("Node not found", 404));
    }

    // Check if node has children
    const childCount = await workflowNodes.count({ where: { parentId: nodeId } });
    if (childCount > 0) {
        return next(new AppError("Cannot delete a node with child nodes. Please remove or reassign its children first.", 400));
    }

    await node.destroy();
    res.status(200).json({ message: "Node deleted successfully" });
});
const removeNodeWithItsBranch = catchError(async (req, res, next) => {
    const { nodeId } = req.params;
    if (!nodeId) {
        return next(new AppError("Node ID is required", 400));
    }
    const node = await workflowNodes.findOne({ where: { id: nodeId } });
    if (!node) {
        return next(new AppError("Node not found", 404));
    }

    // Recursive function to delete a node and its children
    const deleteNodeAndChildren = async (nodeId) => {
        const children = await workflowNodes.findAll({ where: { parentId: nodeId } });
        for (const child of children) {
            await deleteNodeAndChildren(child.id);
        }
        await workflowNodes.destroy({ where: { id: nodeId } });
    };

    await deleteNodeAndChildren(nodeId);
    res.status(204).json({ message: "Node and its branch deleted successfully" });
})
// Greeting Config Endpoints
const getGreeting = catchError(async (req, res, next) => {
    const greetingConfig = await workflow_config.findOne();
    if (!greetingConfig) {
        return next(new AppError("No Greeting message Found.", 404));
    }
    res.status(200).json({ greeting: greetingConfig });
})
const updateGreeting = catchError(async (req, res, next) => {
    const { greeting, greetingAr } = req.body;
    // Find the first config to update
    const config = await workflow_config.findOne();
    if (!config) {
        return next(new AppError("Greeting configuration not found", 404));
    }
    const [updatedRows] = await workflow_config.update(
        { greeting, greetingAr },
        { where: { id: config.id } }
    );
    if (updatedRows === 0) {
        return next(new AppError("Greeting configuration not found", 404));
    }
    const updatedGreeting = await workflow_config.findOne({ where: { id: config.id } });
    res.status(200).json({ greeting: updatedGreeting });
})
const createGreeting = catchError(async (req, res, next) => {
    const { greeting, greetingAr } = req.body;
    const [newGreeting, created] = await workflow_config.findOrCreate({
        where: {},
        defaults: { greeting, greetingAr }
    });
    if (!created) {
        return next(new AppError("Greeting configuration already exists", 409));
    }
    res.status(201).json({ greeting: newGreeting });
})
module.exports = {
    getNodes,
    getRoots,
    NodesTraversal,
    nodeOffsprings,
    singleNode,
    createNode,
    updateNode,
    removeNode,
    removeNodeWithItsBranch,
    /// Greeting Config Endpoints
    getGreeting,
    updateGreeting,
    createGreeting
};
