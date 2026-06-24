/**
 * @vizforge/core — VTK.js 核心封装
 *
 * 提供类型定义、渲染窗口管理、相机控制等基础能力。
 */

export * from './rendering/types';
export * from './rendering/renderWindow';
export * from './io/fileLoader';

/** VTK.js 版本信息 */
export const VTK_VERSION = '30.10.0';
export const PIPELINE_VERSION = '1.0.0';
