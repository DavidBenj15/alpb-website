import { Router } from "express";
import { updateWidget } from "../services/widgetService.js";
import { validationMiddleware } from '../middleware/validation-middleware.js';
import { editWidgetSchema } from "../validators/schemas.js"

const router = Router();

router.patch('/:id', validationMiddleware(editWidgetSchema), async (req, res) => {
    console.log("got the request")
    const { name, description, link, visibility } = req.body;
    const widgetId = Number(req.params.id);
    
    try {
        const result = await updateWidget({ widgetId, widgetName: name, description, redirectLink: link, visibility });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;