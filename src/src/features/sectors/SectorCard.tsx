import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Sector } from '../../lib/types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface SectorCardProps {
    sector: Sector;
    onEdit: (sector: Sector) => void;
    onDelete: (id: string) => void;
}

export const SectorCard: React.FC<SectorCardProps> = ({ sector, onEdit, onDelete }) => {
    return (
        <Card
            hoverable
            className="group relative overflow-hidden"
        >
            {/* Accent Gradient Top */}
            <div
                className="absolute top-0 left-0 right-0 h-1 opacity-80"
                style={{ background: `linear-gradient(90deg, ${sector.color}, ${sector.color}88)` }}
            />

            <div className="flex items-start justify-between pt-2">
                <div className="flex items-center gap-4">
                    {/* Icon Container */}
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                        style={{
                            background: `linear-gradient(135deg, ${sector.color}20, ${sector.color}10)`,
                            border: `1px solid ${sector.color}30`
                        }}
                    >
                        {sector.icon}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white">{sector.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span
                                className="text-2xl font-bold"
                                style={{ color: sector.color }}
                            >
                                {sector.weight}%
                            </span>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">target</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(sector)}
                        className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(sector.id)}
                        className="h-8 w-8 text-gray-400 hover:text-red-400"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-5">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                            width: `${sector.weight}%`,
                            background: `linear-gradient(90deg, ${sector.color}, ${sector.color}88)`,
                            boxShadow: `0 0 10px ${sector.color}50`
                        }}
                    />
                </div>
            </div>
        </Card>
    );
};
