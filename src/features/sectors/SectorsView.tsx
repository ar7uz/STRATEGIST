import { useState } from 'react';
import { Plus, PieChart } from 'lucide-react';
import { useSectorsStore } from './store';
import { SectorCard } from './SectorCard';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import type { Sector } from '../../lib/types';
import { Card } from '../../components/ui/Card';

const COLORS = ['#00D4AA', '#0088FF', '#FF4757', '#FFB800', '#A855F7', '#EC4899'];
const ICONS = ['💼', '📚', '💪', '🎯', '💰', '🧘', '🎨', '🔬', '🌍', '❤️'];

export const SectorsView = () => {
    const { sectors, addSector, updateSector, deleteSector } = useSectorsStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSector, setEditingSector] = useState<Sector | null>(null);
    const [formData, setFormData] = useState({ name: '', icon: '🎯', weight: 20, color: '#00D4AA' });

    const handleOpenCreate = () => {
        setEditingSector(null);
        setFormData({ name: '', icon: '🎯', weight: 20, color: '#00D4AA' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (sector: Sector) => {
        setEditingSector(sector);
        setFormData({
            name: sector.name,
            icon: sector.icon,
            weight: sector.weight,
            color: sector.color
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name.trim()) return;

        if (editingSector) {
            updateSector(editingSector.id, {
                name: formData.name,
                icon: formData.icon,
                weight: Number(formData.weight),
                color: formData.color
            });
        } else {
            addSector({
                name: formData.name,
                icon: formData.icon,
                weight: Number(formData.weight),
                color: formData.color,
                isActive: true,
                sortOrder: sectors.length
            });
        }
        setIsModalOpen(false);
    };

    const totalWeight = sectors.reduce((acc, s) => acc + s.weight, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Sectors</h1>
                    <p className="text-gray-400 mt-1">Define your strategic life areas</p>
                </div>
                <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleOpenCreate}>
                    New Sector
                </Button>
            </div>

            {/* Allocation Summary */}
            <Card variant="elevated" className="overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 flex items-center justify-center">
                            <PieChart className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Total Allocation</h3>
                            <p className="text-sm text-gray-400">Target distribution</p>
                        </div>
                    </div>
                    <div className={`text-3xl font-bold ${totalWeight === 100 ? 'text-cyan-400' : 'text-orange-400'}`}>
                        {totalWeight}%
                    </div>
                </div>

                {/* Visual Distribution Bar */}
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex">
                    {sectors.map((s) => (
                        <div
                            key={s.id}
                            className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                            style={{
                                width: `${(s.weight / Math.max(totalWeight, 100)) * 100}%`,
                                backgroundColor: s.color,
                            }}
                        />
                    ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4">
                    {sectors.map(s => (
                        <div key={s.id} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                            <span className="text-sm text-gray-400">{s.name}</span>
                            <span className="text-sm font-medium text-white">{s.weight}%</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Sectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sectors.map((sector) => (
                    <SectorCard
                        key={sector.id}
                        sector={sector}
                        onEdit={handleOpenEdit}
                        onDelete={deleteSector}
                    />
                ))}

                {/* Add New Card */}
                <button
                    onClick={handleOpenCreate}
                    className="
            glass-card min-h-[160px] p-5
            border-2 border-dashed border-gray-700
            flex flex-col items-center justify-center gap-3
            text-gray-500 hover:text-cyan-400 hover:border-cyan-400/50
            transition-all duration-300
            group
          "
                >
                    <div className="w-12 h-12 rounded-2xl bg-gray-800 group-hover:bg-cyan-400/10 flex items-center justify-center transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-medium">Add Sector</span>
                </button>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSector ? 'Edit Sector' : 'New Sector'}
                description="Define a strategic area of your life"
                size="md"
            >
                <div className="space-y-6">
                    <Input
                        label="Sector Name"
                        placeholder="e.g., Health, Business, Learning..."
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        autoFocus
                    />

                    {/* Icon Picker */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon })}
                                    className={`
                    w-12 h-12 rounded-xl text-xl
                    flex items-center justify-center
                    transition-all duration-200
                    ${formData.icon === icon
                                            ? 'bg-cyan-400/20 border-2 border-cyan-400 scale-110'
                                            : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
                                        }
                  `}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Accent Color</label>
                        <div className="flex gap-3">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color })}
                                    className={`
                    w-10 h-10 rounded-xl
                    transition-all duration-200
                    ${formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : 'hover:scale-105'}
                  `}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Weight Slider */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">Target Weight</label>
                            <span className="text-2xl font-bold text-cyan-400">{formData.weight}%</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>5%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <ModalFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            {editingSector ? 'Save Changes' : 'Create Sector'}
                        </Button>
                    </ModalFooter>
                </div>
            </Modal>
        </div>
    );
};
