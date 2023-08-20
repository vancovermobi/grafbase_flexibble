import {GraphQLClient} from 'graphql-request'

import { createProjectMutation, createUserMutation, deleteProjectMutation, getProjectByIdQuery, getProjectsOfUserQuery, getUserQuery, projectsQuery, updateProjectMutation } from '@/graphql';
import { ProjectForm } from '@/common.types';
import { categoryFilters } from '@/constant';

const isProduction = process.env.NODE_ENV==='production'

const apiUrl = isProduction ? process.env.NEXT_PUBLIC_GRAFBASE_API_URL || '' : 'http://127.0.0.1:4000/graphql';
const apiKey = isProduction ? process.env.NEXT_PUBLIC_GRAFBASE_API_KEY || '' : 'letmein';
const serverUrl = isProduction ? process.env.NEXT_PUBLIC_SERVER_URL : 'http://localhost:3000';

const client = new GraphQLClient(apiUrl)

// User ====
const makeGraphQLRequest = async (query: string, variables = {}) => {
    try {
        return await client.request(query, variables)
    } catch (error:any) {
        console.log('makeGraphQLRequest:', error);
        throw error
    }
}

export const getUser = (email: string) => {
    client.setHeader('x-api-key', apiKey)
    return makeGraphQLRequest(getUserQuery, { email })
}

export const createUser = (name:string, email: string, avatarUrl: string) => {
    client.setHeader('x-api-key', apiKey)
    const variables = {
        input: {
            name: name,
            email: email,
            avatarUrl: avatarUrl
        }
    }
    return makeGraphQLRequest(createUserMutation, variables )
}
// ============================

// Token ====
export const fetchToken = async () => {
    try {
        const response = await fetch(`${serverUrl}/api/auth/token`)

        console.log("action/Fetch Token=ok:", response);

        return response.json()
    } catch (error: any) {
        console.log("Fetch Token error:", error);
        throw error
    }
}
// ============================

// Image ====
export const uploadImage = async (imagePath: string) => {
    //console.log("action/uploadImage/imagePath:", imagePath)
    try {
        const response = await fetch(`${serverUrl}/api/upload`, {
            method: "POST",
            body: JSON.stringify({
                path: imagePath,
            })
        })
        return response.json()
    } catch (error: any) {
        console.log("Upload Image error:", error)
        throw error
    }
}
// ============================

// Project ====
export const fetchAllProjects = (category?: string | null, endcursor?: string | null) => {
    client.setHeader("x-api-key", apiKey)

    const categories = category==null ? categoryFilters : [category]

    return makeGraphQLRequest(projectsQuery, { categories, endcursor })
}
export const getUserProjects = (id: string, last?: number) => {
    client.setHeader("x-api-key", apiKey)
    return makeGraphQLRequest(getProjectsOfUserQuery, { id, last })
}
export const getProjectDetails = (id: string) => {
    client.setHeader("x-api-key", apiKey)
    return makeGraphQLRequest(getProjectByIdQuery, { id })
}
export const createNewProject = async (form: ProjectForm, creatorId: string, token: string) => {
    
    //console.log("createNewProject/form:", form)

    const imageUrl = await uploadImage(form.image);

    //console.log("action/createNewProject/imageUrl:", imageUrl)
  
    if (imageUrl.url) {
      client.setHeader("Authorization", `Bearer ${token}`);
  
      const variables = {
        input: { 
          ...form, 
          image: imageUrl.url, 
          createdBy: { 
            link: creatorId 
          }
        }
      };
      
      console.log("action/createNewProject= ok:", imageUrl)

      return makeGraphQLRequest(createProjectMutation, variables);
    }
};
export const updateProject = async (form: ProjectForm, projectId: string, token: string) => {
    function isBase64DataURL(value: string) {
      const base64Regex = /^data:image\/[a-z]+;base64,/;
      return base64Regex.test(value);
    }
  
    let updatedForm = { ...form };
  
    const isUploadingNewImage = isBase64DataURL(form.image);
  
    if (isUploadingNewImage) {
      const imageUrl = await uploadImage(form.image);
  
      if (imageUrl.url) {
        updatedForm = { ...updatedForm, image: imageUrl.url };
      }
    }
  
    client.setHeader("Authorization", `Bearer ${token}`);
  
    const variables = {
      id: projectId,
      input: updatedForm,
    };
  
    return makeGraphQLRequest(updateProjectMutation, variables);
};  
export const deleteProject = (id: string, token: string) => {
   client.setHeader("Authorization", `Bearer ${token}`);
   return makeGraphQLRequest(deleteProjectMutation, { id });
};
  