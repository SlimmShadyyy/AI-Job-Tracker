import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import Application from '../models/Application.js';

export const createApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { company, role, location, status, requiredSkills, resumeSuggestions } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const newApp = await Application.create({
      userId: req.user?.id,
      company,
      role,
      location,
      status: status || 'Applied',
      
      requiredSkills: typeof requiredSkills === 'string' 
        ? requiredSkills.split(',').map((s: string) => s.trim()) 
        : requiredSkills || [],
        
      resumeSuggestions: resumeSuggestions || [] 
    });

    res.status(201).json(newApp);
  } catch (error) {
    console.error("Create App Error:", error);
    res.status(500).json({ message: 'Error saving application' });
  }
};

export const getApplications = async (req: AuthRequest, res: Response) => {
  try {
    const apps = await Application.find({ userId: req.user?.id });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications' });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedApp = await Application.findOneAndUpdate(
      { _id: id, userId: req.user?.id }, 
      { status },
      { new: true }
    );

    if (!updatedApp) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(updatedApp);
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

export const deleteApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deletedApp = await Application.findOneAndDelete({ 
      _id: id, 
      userId: req.user?.id 
    });

    if (!deletedApp) {
      return res.status(404).json({ message: "Application not found or unauthorized" });
    }

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting" });
  }
};